// ============ server/admin/admin.container.ts ============
import { AdminService } from "./Admin.sercvice";
import { AdminRepository, ClientStatsRepository, SiteStatsRepository, PaymentStatsRepository, RsvpStatsRepository, TemplateStatsRepository, AuditLogRepository, ApiMetricsRepository } from "./Admin.repository";


let instance: AdminService | null = null;

export function getAdminService(): AdminService {
  if (!instance) {
    instance = new AdminService(
      // Repositories
      new AdminRepository(),
      new ClientStatsRepository(),
      new SiteStatsRepository(),
      new PaymentStatsRepository(),
      new RsvpStatsRepository(),
      new TemplateStatsRepository(),
      new AuditLogRepository(),
      new ApiMetricsRepository()
    );
  }
  return instance;
}