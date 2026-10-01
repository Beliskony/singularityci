// ============ authClient/authClient.container.ts ============
import { AuthClientService } from "./authClient.service";
import { ClientRepositoryImpl } from "../client/Client.repository";
import { OtpRepositoryImpl } from "../client/Client.repository"; // corrigé
import { NotImplementedOtpSender } from "./infra/NotImplementOtpSender";
import { GoogleAuthVerifierImpl } from "./infra/GoogleAuthVerifier";
import { RecaptchaVerifierImpl } from "./infra/RecaptchaVerifier";

let instance: AuthClientService | null = null;

export function getAuthClientService(): AuthClientService {
  if (!instance) {
    instance = new AuthClientService(
      new ClientRepositoryImpl(),
      new OtpRepositoryImpl(),
      new NotImplementedOtpSender(),
      new GoogleAuthVerifierImpl(),
      new RecaptchaVerifierImpl()
    );
  }
  return instance;
}