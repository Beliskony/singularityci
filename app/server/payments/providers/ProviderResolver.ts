import type { PaymentProvider } from "../Payment.service";
import { FedaPayProvider } from "./FedaPayProvider";

export class FedaPayResolver {
  private provider: PaymentProvider | null = null;

  resolve(): PaymentProvider {
    if (!this.provider) this.provider = new FedaPayProvider();
    return this.provider;
  }
}