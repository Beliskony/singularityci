import { PaymentService } from "./Payment.service";
import {
  KyselyPaymentRepository,
  KyselySiteReadRepository,
  KyselyTemplateRepository,
} from "./PaymentRepository";

import { SandboxPolicy, SandboxPaymentProvider } from "./PaymentSandbox";
import { getSiteService } from "../sites/site.container"; // adapte au nom réel
import { FedaPayResolver } from "./providers/ProviderResolver";

let instance: PaymentService | null = null;

export function getPaymentService(): PaymentService {
  if (!instance) {
    instance = new PaymentService(
      new KyselyPaymentRepository(),
      new KyselySiteReadRepository(),
      new KyselyTemplateRepository(),
      new FedaPayResolver(),
      getSiteService(),
      SandboxPolicy.fromEnv(),
      new SandboxPaymentProvider()
    );
  }
  return instance;
}