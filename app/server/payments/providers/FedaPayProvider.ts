// ============ payments/providers/FedaPayProvider.ts ============
import { FedaPay, Transaction } from "fedapay";
import type { PaymentProvider, MobileMoneyOperator } from "../Payment.service";

// Opérateurs dont le paiement peut être déclenché directement sur le téléphone (sans redirection).
// Selon la doc FedaPay, en Côte d'Ivoire seul MTN est listé (mode "mtn_ci"). Orange, Wave et Moov CI
// ne sont pas documentés : ils passent par la page FedaPay hébergée, où le client choisit son opérateur.
// Quand FedaPay confirme un identifiant (ex. "wave_ci"), il suffit de l'ajouter ici.
const DIRECT_MODE: Partial<Record<MobileMoneyOperator, string>> = {
  MTN: "mtn_ci",
};

// Le numéro client est au format "+225XXXXXXXXXX" ; FedaPay attend
// le numéro et l'indicatif pays séparés
function splitIvorianPhone(phone: string): { number: string; country: string } {
  // Le formulaire envoie ce que l'utilisateur tape (« +225 07 00 00 00 00 ») : on ne garde que
  // les chiffres, sinon les espaces partent chez FedaPay et le numéro est refusé.
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("225") && digits.length > 10 ? digits.slice(3) : digits;
  return { number, country: "CI" }; // la doc FedaPay montre un code pays en majuscules (ex. "BJ")
}

export class FedaPayProvider implements PaymentProvider {
  readonly name = "FEDAPAY";

  constructor(env: NodeJS.ProcessEnv = process.env) {
    if (!env.FEDAPAY_SECRET_KEY) throw new Error("FEDAPAY_SECRET_KEY manquante");
    if (!env.APP_BASE_URL) throw new Error("APP_BASE_URL manquante");
    FedaPay.setApiKey(env.FEDAPAY_SECRET_KEY);
    FedaPay.setEnvironment(env.FEDAPAY_ENVIRONMENT === "live" ? "live" : "sandbox");
  }

  async initiateCharge(params: {
    amount: number;
    reference: string;
    clientPhone?: string;
    operator?: MobileMoneyOperator;
  }): Promise<{ providerTransactionRef: string; redirectUrl?: string }> {
    const customer = params.clientPhone
      ? {
          firstname: "Client",
          lastname: "SINGULARITY.CI",
          phone_number: splitIvorianPhone(params.clientPhone),
        }
      : undefined;

    const transaction = await Transaction.create({
      description: `Achat template — réf ${params.reference}`,
      amount: params.amount,
      currency: { iso: "XOF" },
      callback_url: `${process.env.APP_BASE_URL}/dashboard/payments/${params.reference}/callback`,
      custom_metadata: { internalPaymentId: params.reference },
      customer,
    } as any);

    const tokenData = await (transaction as any).generateToken();

    const providerTransactionRef = String((transaction as any).id);

    // Opérateur à mode direct : la demande part sur le téléphone, le client valide (USSD/appli) et la
    // page de retour suit le statut. En cas d'échec on retombe sur la page hébergée plutôt que de bloquer.
    const mode = params.operator ? DIRECT_MODE[params.operator] : undefined;
    if (mode && params.clientPhone) {
      try {
        await (transaction as any).sendNowWithToken(mode, tokenData.token, splitIvorianPhone(params.clientPhone));
        return { providerTransactionRef };
      } catch (err) {
        console.error("[FedaPay] envoi direct impossible, repli sur la page hébergée", mode, err);
      }
    }

    return { providerTransactionRef, redirectUrl: tokenData.url };
  }

  // Relit la transaction chez FedaPay. Statuts documentés : pending, approved, canceled ;
  // declined et transferred existent aussi (événements du webhook). Tout statut inconnu est
  // traité comme PENDING : on ne règle jamais un paiement sur une valeur qu'on ne comprend pas.
  async checkStatus(
    providerTransactionRef: string
  ): Promise<{ outcome: "SUCCESS" | "FAILED" | "PENDING"; amount: number }> {
    const transaction = await (Transaction as any).retrieve(providerTransactionRef);
    const status = String(transaction.status ?? "").toLowerCase();

    let outcome: "SUCCESS" | "FAILED" | "PENDING" = "PENDING";
    if (status === "approved" || status === "transferred") outcome = "SUCCESS";
    else if (status === "declined" || status === "canceled" || status === "cancelled") outcome = "FAILED";

    return { outcome, amount: Number(transaction.amount) };
  }

  async refund(_providerTransactionRef: string, _amount: number): Promise<void> {
    // TODO — endpoint de remboursement FedaPay à confirmer avant mise en prod
    throw new Error(
      "FedaPayProvider.refund() non implémenté — endpoint à confirmer avec FedaPay avant mise en prod"
    );
  }
}