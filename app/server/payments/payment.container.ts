// ============ server/payments/payment.container.ts ============
import { PaymentService } from "./Payment.service";

let instance: PaymentService | null = null;

export function getPaymentService(): PaymentService {
  if (!instance) {
    throw new Error(
      "PaymentService non câblé : PaymentRepository, SiteReadRepository, TemplateRepository, PaymentProviderResolver et SiteService manquent encore."
    );
  }
  return instance;
}