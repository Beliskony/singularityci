// ============ server/admin/admin.container.ts ============
import { AdminService } from "./Admin.sercvice";

let instance: AdminService | null = null;

export function getAdminService(): AdminService {
  if (!instance) {
    throw new Error(
      "AdminService non câblé : AdminRepository, ClientStatsRepository, SiteStatsRepository, PaymentStatsRepository, RsvpStatsRepository, TemplateStatsRepository et AuditLogRepository manquent encore."
    );
  }
  return instance;
}