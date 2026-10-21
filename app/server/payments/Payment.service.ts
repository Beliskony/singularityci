// ============ payments/Payment.service.ts ============
import { IPayment, PaymentMethod, PaymentStatus } from "./IPayment";
import { InitiatePaymentInput } from "./PaymentSchemaZod";
import { SiteService } from "../sites/Site.service";
import { SiteStatus } from "../sites/ISite";
import {
  SandboxPaymentProvider,
  SandboxPolicy,
  SANDBOX_PROVIDER_NAME,
} from "./PaymentSandbox";

// ---- Contrats des repositories ----

interface PaymentRepository {
  create(data: Partial<IPayment>): Promise<IPayment>;
  findById(id: string): Promise<IPayment | null>;
  findByProviderRef(ref: string): Promise<IPayment | null>;
  findLatestBySite(siteId: string): Promise<IPayment | null>;
  updateStatus(id: string, status: PaymentStatus): Promise<void>;
  attachProviderRef(id: string, provider: string, ref: string): Promise<void>;
}

interface SiteReadRepository {
  findById(siteId: string): Promise<{ id: string; clientId: string; status: SiteStatus; templateId: string } | null>;
}

interface TemplateRepository {
  getPrice(templateId: string): Promise<number | null>; // null si template inexistant/inactif
}

export type MobileMoneyOperator = "MTN" | "ORANGE" | "WAVE" | "MOOV";
export const MOBILE_MONEY_OPERATORS: readonly MobileMoneyOperator[] = ["MTN", "ORANGE", "WAVE", "MOOV"];

// Contrat commun à toutes les implémentations — chacune vit dans payments/providers/
export interface PaymentProvider {
  readonly name: string;
  initiateCharge(params: {
    amount: number;
    reference: string; // notre paymentId interne, pour retrouver le paiement au retour du webhook
    clientPhone?: string; // requis pour mobile money
    operator?: MobileMoneyOperator; // choisi par le client (MTN, Orange, Wave, Moov)
  }): Promise<{ providerTransactionRef: string; redirectUrl?: string }>;

  refund(providerTransactionRef: string, amount: number): Promise<void>;

  // Optionnel : interroge directement le provider pour connaître l'état réel d'une transaction.
  // Sert de filet quand le webhook n'arrive pas (poste local, retard, webhook désactivé).
  checkStatus?(providerTransactionRef: string): Promise<{
    outcome: "SUCCESS" | "FAILED" | "PENDING";
    amount: number;
  }>;
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
    private siteService: SiteService,
    private sandboxPolicy: SandboxPolicy,
    private sandboxProvider: SandboxPaymentProvider
  ) {}

  // =========================================================
  // INITIATION (client)
  // =========================================================

  async initiatePayment(
    clientId: string,
    clientPhone: string,
    input: InitiatePaymentInput,
    operator?: MobileMoneyOperator
  ): Promise<{ paymentId: string; redirectUrl?: string }> {
    const site = await this.siteRepo.findById(input.siteId);
    if (!site) throw new NotFoundError("SITE");
    if (site.clientId !== clientId) throw new OwnershipError();

    if (site.status !== SiteStatus.DRAFT && site.status !== SiteStatus.PENDING_PAYMENT) {
      throw new BusinessRuleError("SITE_NOT_PAYABLE_IN_CURRENT_STATUS");
    }

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
      provider: "", // renseigné par attachProviderRef après l'appel au provider
      providerTransactionRef: "",
      status: PaymentStatus.PENDING,
    });

    const useSandbox = this.sandboxPolicy.appliesTo(clientId);
    const provider: PaymentProvider = useSandbox
      ? this.sandboxProvider
      : this.providerResolver.resolve(input.method);

    let charge: { providerTransactionRef: string; redirectUrl?: string };
    try {
      charge = await provider.initiateCharge({
        amount,
        reference: payment.id,
        clientPhone: input.method === PaymentMethod.MOBILE_MONEY ? clientPhone : undefined,
        operator: input.method === PaymentMethod.MOBILE_MONEY ? operator : undefined,
      });
    } catch (err) {
      // sinon le paiement reste PENDING et bloque le client (PAYMENT_ALREADY_IN_PROGRESS)
      await this.paymentRepo.updateStatus(payment.id, PaymentStatus.FAILED);
      throw err;
    }

    await this.paymentRepo.attachProviderRef(payment.id, provider.name, charge.providerTransactionRef);

    if (useSandbox) {
      // simule le webhook de succès, sans passer par la route publique
      await this.settle(
        { ...payment, provider: provider.name, providerTransactionRef: charge.providerTransactionRef },
        "SUCCESS",
        amount
      );
      // Pas de page provider à visiter : on renvoie directement vers la page de retour,
      // qui lira le statut SUCCESS déjà enregistré et redirigera vers le dashboard.
      // (Sans redirectUrl, le formulaire de paiement affichait « pas de lien de paiement ».)
      return {
        paymentId: payment.id,
        redirectUrl: `${process.env.APP_BASE_URL ?? ""}/dashboard/payments/${payment.id}/callback`,
      };
    }

    return { paymentId: payment.id, redirectUrl: charge.redirectUrl };
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

    // Un paiement sandbox ne se règle jamais via la route publique
    if (payment.provider === SANDBOX_PROVIDER_NAME) {
      throw new BusinessRuleError("SANDBOX_PAYMENT_NOT_SETTLEABLE_VIA_WEBHOOK");
    }

    await this.settle(payment, outcome, confirmedAmount);
  }

  private async settle(
    payment: IPayment,
    outcome: "SUCCESS" | "FAILED",
    confirmedAmount: number
  ): Promise<void> {
    // Idempotence : un webhook peut être renvoyé plusieurs fois par le provider
    if (payment.status === PaymentStatus.SUCCESS || payment.status === PaymentStatus.FAILED) {
      return;
    }

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

  // =========================================================
  // STATUT (page de confirmation côté client)
  // =========================================================

  async getStatus(
    clientId: string,
    paymentId: string
  ): Promise<{ paymentId: string; siteId: string; status: PaymentStatus }> {
    let payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundError("PAYMENT");
    if (payment.clientId !== clientId) throw new OwnershipError();

    // Encore PENDING : on demande son état réel au provider plutôt que d'attendre uniquement
    // le webhook (qui ne peut pas joindre un poste local, et peut arriver en retard).
    if (payment.status === PaymentStatus.PENDING) {
      try {
        await this.syncPayment(payment);
        payment = (await this.paymentRepo.findById(paymentId)) ?? payment;
      } catch (err) {
        console.error("[payments] synchronisation provider impossible", err);
      }
    }

    return { paymentId: payment.id, siteId: payment.siteId, status: payment.status };
  }

  // =========================================================
  // SYNCHRONISATION (webhook ou interrogation depuis la page de retour)
  // =========================================================

  // Point d'entrée du webhook : le contenu de la notification n'est jamais cru tel quel.
  // On l'utilise uniquement pour retrouver la transaction, puis on relit son état et son
  // montant auprès du provider avant de régler quoi que ce soit.
  async syncByProviderRef(providerTransactionRef: string): Promise<void> {
    const payment = await this.paymentRepo.findByProviderRef(providerTransactionRef);
    if (!payment) throw new NotFoundError("PAYMENT");
    await this.syncPayment(payment);
  }

  private async syncPayment(payment: IPayment): Promise<void> {
    if (payment.status !== PaymentStatus.PENDING) return;
    if (payment.provider === SANDBOX_PROVIDER_NAME) return; // réglé à la création
    if (!payment.providerTransactionRef) return;

    const provider = this.providerResolver.resolve(payment.method);
    if (!provider.checkStatus) return;

    const state = await provider.checkStatus(payment.providerTransactionRef);
    if (state.outcome === "PENDING") return;

    await this.settle(payment, state.outcome, state.amount);
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

    const provider: PaymentProvider =
      payment.provider === SANDBOX_PROVIDER_NAME
        ? this.sandboxProvider
        : this.providerResolver.resolve(payment.method);

    await provider.refund(payment.providerTransactionRef, payment.amount);

    await this.paymentRepo.updateStatus(payment.id, PaymentStatus.REFUNDED);
    await this.siteService.deactivateAfterRefund(payment.siteId);
  }
}