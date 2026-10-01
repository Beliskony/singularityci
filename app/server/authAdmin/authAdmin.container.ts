// ============ server/authAdmin/authAdmin.container.ts ============
import { AuthAdminService } from "./authAdmin.service";

let instance: AuthAdminService | null = null;

export function getAuthAdminService(): AuthAdminService {
  if (!instance) {
    throw new Error(
      "AuthAdminService non câblé : AdminRepository, PasswordResetRepository et ResetEmailSender manquent encore."
    );
  }
  return instance;
}