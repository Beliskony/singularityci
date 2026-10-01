// ============ admin/Admin.service.ts ============
import {
  IAdmin,
  IAdminAuthPayload,
  AdminRole,
  AdminPermission,
  AuditAction,
  IDateRange,
  IDashboardStats,
  IRevenueStats,
  ITemplateStat,
  IClientGrowthPoint,
} from "./IAdmin";
import { CreateModeratorInput } from "./AdminSchemaZod";
import { SiteStatus } from "../sites/ISite";
import bcrypt from "bcrypt";


// ---- Contrats des repositories (implémentations réelles branchées séparément) ----

interface AdminRepository {
  findById(id: string): Promise<IAdmin | null>;
  findByEmail(email: string): Promise<IAdmin | null>;
  create(data: Partial<IAdmin>): Promise<IAdmin>;
  listModerators(): Promise<IAdmin[]>;
  updatePermissions(id: string, permissions: AdminPermission[]): Promise<IAdmin>;
  setActive(id: string, isActive: boolean): Promise<void>;
}

interface ClientStatsRepository {
  countAll(): Promise<number>;
  countCreatedBetween(range: IDateRange): Promise<number>;
  getGrowth(range: IDateRange, granularity: "day" | "week" | "month"): Promise<IClientGrowthPoint[]>;
}

interface SiteStatsRepository {
  countByStatus(): Promise<Record<SiteStatus, number>>;
  countExpiringBefore(date: Date): Promise<number>;
  countCreatedBetween(range: IDateRange): Promise<number>;
  countPaidBetween(range: IDateRange): Promise<number>;
  forceExpire(siteId: string): Promise<void>;
}

interface PaymentStatsRepository {
  getRevenueStats(range: IDateRange): Promise<IRevenueStats>;
  refund(paymentId: string, reason: string): Promise<void>;
}

interface RsvpStatsRepository {
  countAll(): Promise<number>;
}

interface TemplateStatsRepository {
  getTopTemplates(range: IDateRange, limit: number): Promise<ITemplateStat[]>;
}

interface AuditLogRepository {
  log(adminId: string, action: AuditAction, targetId?: string, metadata?: Record<string, unknown>): Promise<void>;
}

// ---- Erreurs métier typées (plus propre que des strings éparpillées) ----

export class ForbiddenError extends Error {
  constructor(permission: string) {
    super(`FORBIDDEN: missing permission ${permission}`);
    this.name = "ForbiddenError";
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class AdminService {
  constructor(
    private adminRepo: AdminRepository,
    private clientStats: ClientStatsRepository,
    private siteStats: SiteStatsRepository,
    private paymentStats: PaymentStatsRepository,
    private rsvpStats: RsvpStatsRepository,
    private templateStats: TemplateStatsRepository,
    private auditLog: AuditLogRepository
  ) {}

  // =========================================================
  // GESTION DES MODÉRATEURS
  // =========================================================

  async createModerator(caller: IAdminAuthPayload, input: CreateModeratorInput): Promise<IAdmin> {
    this.assertPermission(caller, AdminPermission.MANAGE_ADMINS);

    const existing = await this.adminRepo.findByEmail(input.email);
    if (existing) throw new BusinessRuleError("EMAIL_ALREADY_USED");

    const passwordHash = await bcrypt.hash(input.password, 12);

    const moderator = await this.adminRepo.create({
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      role: AdminRole.MODERATOR,
      permissions: input.permissions,
      isActive: true,
      createdBy: caller.adminId,
    });

    await this.auditLog.log(caller.adminId, AuditAction.CREATE_MODERATOR, moderator.id, {
      email: moderator.email,
      permissions: moderator.permissions,
    });

    return moderator;
  }

  async updatePermissions(
    caller: IAdminAuthPayload,
    targetAdminId: string,
    permissions: AdminPermission[]
  ): Promise<IAdmin> {
    this.assertPermission(caller, AdminPermission.MANAGE_ADMINS);

    const target = await this.adminRepo.findById(targetAdminId);
    if (!target) throw new BusinessRuleError("ADMIN_NOT_FOUND");

    if (target.role === AdminRole.SUPER_ADMIN) {
      throw new BusinessRuleError("CANNOT_MODIFY_SUPER_ADMIN_PERMISSIONS");
    }
    if (permissions.includes(AdminPermission.MANAGE_ADMINS)) {
      throw new BusinessRuleError("MODERATOR_CANNOT_RECEIVE_MANAGE_ADMINS");
    }

    const updated = await this.adminRepo.updatePermissions(targetAdminId, permissions);

    await this.auditLog.log(caller.adminId, AuditAction.UPDATE_PERMISSIONS, targetAdminId, {
      newPermissions: permissions,
    });

    return updated;
  }

  async deactivateAdmin(caller: IAdminAuthPayload, targetAdminId: string): Promise<void> {
    this.assertPermission(caller, AdminPermission.MANAGE_ADMINS);

    if (caller.adminId === targetAdminId) {
      throw new BusinessRuleError("CANNOT_DEACTIVATE_SELF");
    }

    const target = await this.adminRepo.findById(targetAdminId);
    if (!target) throw new BusinessRuleError("ADMIN_NOT_FOUND");
    if (target.role === AdminRole.SUPER_ADMIN) {
      throw new BusinessRuleError("CANNOT_DEACTIVATE_SUPER_ADMIN");
    }

    await this.adminRepo.setActive(targetAdminId, false);
    await this.auditLog.log(caller.adminId, AuditAction.DEACTIVATE_ADMIN, targetAdminId);
  }

  async listModerators(caller: IAdminAuthPayload): Promise<IAdmin[]> {
    this.assertPermission(caller, AdminPermission.MANAGE_ADMINS);
    return this.adminRepo.listModerators();
  }

  // =========================================================
  // STATISTIQUES / DASHBOARD
  // =========================================================

  async getDashboardStats(caller: IAdminAuthPayload, range: IDateRange): Promise<IDashboardStats> {
    this.assertPermission(caller, AdminPermission.VIEW_ANALYTICS);

    // Toutes les requêtes indépendantes en parallèle : pas de raison de les sérialiser
    const [
      totalClients,
      newClientsInRange,
      sitesByStatus,
      expiringSoonCount,
      totalRsvps,
      revenue,
      topTemplates,
      sitesCreatedInRange,
      sitesPaidInRange,
    ] = await Promise.all([
      this.clientStats.countAll(),
      this.clientStats.countCreatedBetween(range),
      this.siteStats.countByStatus(),
      this.siteStats.countExpiringBefore(this.inDays(7)),
      this.rsvpStats.countAll(),
      this.paymentStats.getRevenueStats(range),
      this.templateStats.getTopTemplates(range, 5),
      this.siteStats.countCreatedBetween(range),
      this.siteStats.countPaidBetween(range),
    ]);

    return {
      totalClients,
      newClientsInRange,
      sitesByStatus,
      activeSitesCount: sitesByStatus[SiteStatus.ACTIVE] ?? 0,
      expiringSoonCount,
      totalRsvps,
      revenue,
      topTemplates,
      conversionRate: this.computeConversionRate(sitesCreatedInRange, sitesPaidInRange),
    };
  }

  async getRevenueStats(caller: IAdminAuthPayload, range: IDateRange): Promise<IRevenueStats> {
    this.assertPermission(caller, AdminPermission.VIEW_ANALYTICS);
    return this.paymentStats.getRevenueStats(range);
  }

  async getClientGrowth(
    caller: IAdminAuthPayload,
    range: IDateRange,
    granularity: "day" | "week" | "month" = "day"
  ): Promise<IClientGrowthPoint[]> {
    this.assertPermission(caller, AdminPermission.VIEW_ANALYTICS);
    return this.clientStats.getGrowth(range, granularity);
  }

  async getTopTemplates(caller: IAdminAuthPayload, range: IDateRange, limit = 5): Promise<ITemplateStat[]> {
    this.assertPermission(caller, AdminPermission.VIEW_ANALYTICS);
    return this.templateStats.getTopTemplates(range, limit);
  }

  // =========================================================
  // ACTIONS ADMINISTRATIVES SUR LES SITES / PAIEMENTS
  // =========================================================

  async forceExpireSite(caller: IAdminAuthPayload, siteId: string, reason: string): Promise<void> {
    this.assertPermission(caller, AdminPermission.MANAGE_SITES);
    await this.siteStats.forceExpire(siteId);
    await this.auditLog.log(caller.adminId, AuditAction.FORCE_EXPIRE_SITE, siteId, { reason });
  }

  async refundPayment(caller: IAdminAuthPayload, paymentId: string, reason: string): Promise<void> {
    this.assertPermission(caller, AdminPermission.MANAGE_PAYMENTS);
    if (!reason || reason.trim().length < 5) {
      throw new BusinessRuleError("REFUND_REASON_REQUIRED");
    }
    await this.paymentStats.refund(paymentId, reason);
    await this.auditLog.log(caller.adminId, AuditAction.REFUND_PAYMENT, paymentId, { reason });
  }

  // =========================================================
  // HELPERS PRIVÉS
  // =========================================================

  private assertPermission(caller: IAdminAuthPayload, permission: AdminPermission): void {
    if (caller.role === AdminRole.SUPER_ADMIN) return; // accès total implicite
    if (!caller.permissions.includes(permission)) {
      throw new ForbiddenError(permission);
    }
  }

  private computeConversionRate(created: number, paid: number): number {
    if (created === 0) return 0;
    return Math.round((paid / created) * 10000) / 100; // pourcentage à 2 décimales
  }

  private inDays(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}