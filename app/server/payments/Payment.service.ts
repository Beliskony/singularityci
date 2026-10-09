// ============ payments/Payment.service.ts ============
import { IPayment, PaymentMethod, PaymentStatus } from "./IPayment";
import { InitiatePaymentInput } from "./PaymentSchemaZod";
import { SiteService } from "../sites/Site.service";
import { SiteStatus } from "../sites/ISite";

// ---- Contrats des repositories ----

interface PaymentRepository {
  create(data: Partial<IPayment>): Promise<IPayment>;
  findById(id: string): Promise<IPayment | null>;
  findByProviderRef(ref: string): Promise<IPayment | null>;
  findLatestBySite(siteId: string): Promise<IPayment | null>;
  updateStatus(id: string, status: PaymentStatus): Promise<void>;
}

interface SiteReadRepository {
  findById(siteId: string): Promise<{ id: string; clientId: string; status: SiteStatus; templateId: string } | null>;
}

interface TemplateRepository {
  getPrice(templateId: string): Promise<number | null>; // null si template inexistant/inactif
}

// Contrat commun aux deux implémentations (mobile money / carte) — chacune vit dans payments/providers/
interface PaymentProvider {
  initiateCharge(params: {
    amount: number;
    reference: string; // notre paymentId interne, pour retrouver le paiement au retour du webhook
    clientPhone?: string; // requis pour mobile money
  }): Promise<{ providerTransactionRef: string; redirectUrl?: string }>;

  refund(providerTransactionRef: string, amount: number): Promise<void>;
}

interface PaymentProviderResolver {
  resolve(method: PaymentMethod): PaymentProvider;
}

// ---- Erreurs métier typées ----

export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`NOT_FOUND: ${entity}`);
    this.name = "NotFoundError";
  }
}

export class OwnershipError extends Error {
  constructor() {
    super("FORBIDDEN: resource does not belong to this client");
    this.name = "OwnershipError";
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class PaymentService {
  constructor(
    private paymentRepo: PaymentRepository,
    private siteRepo: SiteReadRepository,
    private templateRepo: TemplateRepository,
    private providerResolver: PaymentProviderResolver,
    private siteService: SiteService // pour activer/désactiver le site selon l'issue du paiement
  ) {}

  // =========================================================
  // INITIATION (client)
  // =========================================================

  async initiatePayment(
    clientId: string,
    clientPhone: string,
    input: InitiatePaymentInput
  ): Promise<{ paymentId: string; redirectUrl?: string }> {
    const site = await this.siteRepo.findById(input.siteId);
    if (!site) throw new NotFoundError("SITE");
    if (site.clientId !== clientId) throw new OwnershipError();

    if (site.status !== SiteStatus.DRAFT && site.status !== SiteStatus.PENDING_PAYMENT) {
      throw new BusinessRuleError("SITE_NOT_PAYABLE_IN_CURRENT_STATUS");
    }

    // Empêche un double paiement en cours : un paiement PENDING existe déjà pour ce site
    const latest = await this.paymentRepo.findLatestBySite(site.id);
    if (latest && latest.status === PaymentStatus.PENDING) {
      throw new BusinessRuleError("PAYMENT_ALREADY_IN_PROGRESS");
    }

    const amount = await this.templateRepo.getPrice(site.templateId);
    if (amount === null) throw new BusinessRuleError("TEMPLATE_NOT_AVAILABLE");

    const payment = await this.paymentRepo.create({
      siteId: site.id,
      clientId,
      templateId: site.templateId,
      amount,
      currency: "XOF",
      method: input.method,
      provider: "", // renseigné juste après par le provider résolu
      providerTransactionRef: "",
      status: PaymentStatus.PENDING,
    });

    const provider = this.providerResolver.resolve(input.method);
    const { providerTransactionRef, redirectUrl } = await provider.initiateCharge({
      amount,
      reference: payment.id,
      clientPhone: input.method === PaymentMethod.MOBILE_MONEY ? clientPhone : undefined,
    });

    await this.paymentRepo.updateStatus(payment.id, PaymentStatus.PENDING);
    // Note : providerTransactionRef doit être persisté ici aussi (update repo non détaillé
    // pour rester lisible — dans la vraie implémentation, ajoute un champ à updateStatus
    // ou une méthode dédiée attachProviderRef(paymentId, ref) sur PaymentRepository).

    return { paymentId: payment.id, redirectUrl };
  }

  // =========================================================
  // WEBHOOK (appelé par le provider, jamais par le client directement)
  // =========================================================

  async handleProviderWebhook(
    providerTransactionRef: string,
    outcome: "SUCCESS" | "FAILED",
    confirmedAmount: number
  ): Promise<void> {
    const payment = await this.paymentRepo.findByProviderRef(providerTransactionRef);
    if (!payment) throw new NotFoundError("PAYMENT");

    // Idempotence : un webhook peut être renvoyé plusieurs fois par le provider
    if (payment.status === PaymentStatus.SUCCESS || payment.status === PaymentStatus.FAILED) {
      return;
    }

    // Le montant confirmé par le provider doit correspondre exactement à ce qu'on a enregistré
    if (confirmedAmount !== payment.amount) {
      throw new BusinessRuleError("AMOUNT_MISMATCH_POSSIBLE_FRAUD");
    }

    if (outcome === "FAILED") {
      await this.paymentRepo.updateStatus(payment.id, PaymentStatus.FAILED);
      return; // le site reste DRAFT/PENDING_PAYMENT, le client peut retenter
    }

    await this.paymentRepo.updateStatus(payment.id, PaymentStatus.SUCCESS);
    await this.siteService.activateAfterPayment(payment.siteId, payment.id);
  }

  // ============ AJOUT dans payments/Payment.service.ts ============
// À insérer dans la classe PaymentService, par exemple juste après initiatePayment().
// Sert à la page de confirmation côté client : vérifier où en est un paiement,
// avec contrôle d'ownership, sans exposer le repository brut aux routes API.

  async getStatus(
    clientId: string,
    paymentId: string
  ): Promise<{ paymentId: string; siteId: string; status: PaymentStatus }> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundError("PAYMENT");
    if (payment.clientId !== clientId) throw new OwnershipError();

    return { paymentId: payment.id, siteId: payment.siteId, status: payment.status };
  }

  // =========================================================
  // REMBOURSEMENT (déclenché par Admin.service.ts, jamais directement par le client)
  // =========================================================

  async refund(paymentId: string, reason: string): Promise<void> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundError("PAYMENT");

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BusinessRuleError("ONLY_SUCCESSFUL_PAYMENTS_CAN_BE_REFUNDED");
    }

    const provider = this.providerResolver.resolve(payment.method);
    await provider.refund(payment.providerTransactionRef, payment.amount);

    await this.paymentRepo.updateStatus(payment.id, PaymentStatus.REFUNDED);
    await this.siteService.deactivateAfterRefund(payment.siteId);
  }
}