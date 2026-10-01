// ============ payments/providers/FedaPayProvider.ts ============
import { FedaPay, Transaction } from "fedapay";

const FEDAPAY_ENV = process.env.FEDAPAY_ENVIRONMENT === "live" ? "live" : "sandbox";
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY!);
FedaPay.setEnvironment(FEDAPAY_ENV);

// Interface définie dans Payment.service.ts
interface PaymentProvider {
  initiateCharge(params: {
    amount: number;
    reference: string;
    clientPhone?: string;
  }): Promise<{ providerTransactionRef: string; redirectUrl?: string }>;

  refund(providerTransactionRef: string, amount: number): Promise<void>;
}

// Le numéro client est stocké au format "+225XXXXXXXXXX" ; FedaPay attend
// le numéro et l'indicatif pays séparés
function splitIvorianPhone(phone: string): { number: string; country: string } {
  const withoutPlus = phone.replace(/^\+/, "");
  const number = withoutPlus.startsWith("225") ? withoutPlus.slice(3) : withoutPlus;
  return { number, country: "ci" };
}

export class FedaPayProvider implements PaymentProvider {
  async initiateCharge(params: {
    amount: number;
    reference: string;
    clientPhone?: string;
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
      // On stocke notre référence interne dans metadata pour pouvoir la retrouver
      // même si jamais le mapping providerTransactionRef venait à manquer
      custom_metadata: { internalPaymentId: params.reference },
      customer,
    } as any);

    const tokenData = await (transaction as any).generateToken();

    return {
      providerTransactionRef: String((transaction as any).id),
      redirectUrl: tokenData.url,
    };
  }

  async refund(providerTransactionRef: string, amount: number): Promise<void> {
    // ⚠️ TODO — endpoint de remboursement FedaPay non confirmé avec certitude
    // dans la documentation consultée. La transaction expose un champ
    // `refunded_at`, ce qui suggère que la fonctionnalité existe côté FedaPay,
    // mais vérifie l'endpoint exact (dashboard FedaPay > support, ou API
    // Reference complète) avant de considérer ce code comme prêt pour la prod.
    throw new Error(
      "FedaPayProvider.refund() non implémenté — endpoint à confirmer avec FedaPay avant mise en prod"
    );
  }
}