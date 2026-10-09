// ============ admin/Admin.repository.ts ============
import { randomUUID } from "crypto";
import { sql } from "kysely";
import { db } from "../config/Connection";
import { IAdmin, AdminPermission, AdminRole, AuditAction } from "./IAdmin";
import {
  IDateRange,
  IRevenueStats,
  ITemplateStat,
  IClientGrowthPoint,
} from "./IAdmin";
import { IApiMetrics, IApiRequestsByDay } from "./IAdminStats.type";
import { SiteStatus } from "../sites/ISite";
import { PaymentMethod } from "../payments/IPayment";
import { BusinessRuleError } from "./Admin.sercvice";

// Statuts de site considérés comme « payés » (cohérent avec sp_get_dashboard_stats)
const PAID_SITE_STATUSES = [SiteStatus.ACTIVE, SiteStatus.EXPIRED, SiteStatus.ARCHIVED];

// MariaDB renvoie les colonnes JSON (longtext) sous forme de string.
function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function toAdmin(row: any): IAdmin {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    role: row.role as AdminRole,
    permissions: parseJson<AdminPermission[]>(row.permissions, []),
    isActive: Boolean(row.is_active),
    createdBy: row.created_by ?? undefined,
    lastLoginAt: row.last_login_at ?? undefined,
    failedLoginAttempts: Number(row.failed_login_attempts ?? 0),
    lockedUntil: row.locked_until ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------
// Admins
// ---------------------------------------------------------

export class AdminRepository {
  async findById(id: string): Promise<IAdmin | null> {
    const row = await db.selectFrom("admins").selectAll().where("id", "=", id).executeTakeFirst();
    return row ? toAdmin(row) : null;
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    const row = await db
      .selectFrom("admins")
      .selectAll()
      .where("email", "=", email.trim().toLowerCase())
      .executeTakeFirst();
    return row ? toAdmin(row) : null;
  }

  async create(data: Partial<IAdmin>): Promise<IAdmin> {
    const id = randomUUID();
    await db
      .insertInto("admins")
      .values({
        id,
        email: data.email!.trim().toLowerCase(),
        password_hash: data.passwordHash!,
        full_name: data.fullName!,
        role: data.role ?? AdminRole.MODERATOR,
        permissions: JSON.stringify(data.permissions ?? []),
        is_active: data.isActive ?? true ? true : false,
        created_by: data.createdBy ?? null,
      })
      .execute();

    const created = await this.findById(id);
    if (!created) throw new Error("ADMIN_CREATION_FAILED");
    return created;
  }

  async listModerators(): Promise<IAdmin[]> {
    const rows = await db
      .selectFrom("admins")
      .selectAll()
      .where("role", "=", AdminRole.MODERATOR)
      .orderBy("created_at", "desc")
      .execute();
    return rows.map(toAdmin);
  }

  async updatePermissions(id: string, permissions: AdminPermission[]): Promise<IAdmin> {
    await db
      .updateTable("admins")
      .set({ permissions: JSON.stringify(permissions) })
      .where("id", "=", id)
      .execute();

    const updated = await this.findById(id);
    if (!updated) throw new BusinessRuleError("ADMIN_NOT_FOUND");
    return updated;
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await db
      .updateTable("admins")
      .set({
        is_active: isActive ? true : false,
        // une réactivation repart d'un compte propre
        ...(isActive ? { failed_login_attempts: 0, locked_until: null } : {}),
      })
      .where("id", "=", id)
      .execute();
  }
}

// ---------------------------------------------------------
// Clients
// ---------------------------------------------------------

export class ClientStatsRepository {
  async countAll(): Promise<number> {
    const r = await db
      .selectFrom("clients")
      .select(db.fn.countAll().as("n"))
      .where("deleted_at", "is", null)
      .executeTakeFirst();
    return Number(r?.n ?? 0);
  }

  async countCreatedBetween(range: IDateRange): Promise<number> {
    const r = await db
      .selectFrom("clients")
      .select(db.fn.countAll().as("n"))
      .where("deleted_at", "is", null)
      .where("created_at", ">=", range.from)
      .where("created_at", "<=", range.to)
      .executeTakeFirst();
    return Number(r?.n ?? 0);
  }

  async getGrowth(
    range: IDateRange,
    granularity: "day" | "week" | "month"
  ): Promise<IClientGrowthPoint[]> {
    // Expression choisie dans une liste fermée : sql.raw est sûr ici.
    const bucket = {
      day: sql.raw(`DATE_FORMAT(created_at, '%Y-%m-%d')`),
      week: sql.raw(`DATE_FORMAT(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY), '%Y-%m-%d')`),
      month: sql.raw(`DATE_FORMAT(created_at, '%Y-%m-01')`),
    }[granularity];

    const { rows } = await sql<{ bucket: string; n: number }>`
      SELECT ${bucket} AS bucket, COUNT(*) AS n
      FROM clients
      WHERE deleted_at IS NULL
        AND created_at BETWEEN ${range.from} AND ${range.to}
      GROUP BY bucket
      ORDER BY bucket
    `.execute(db);

    return rows.map((r) => ({ date: r.bucket, newClients: Number(r.n) }));
  }
}

// ---------------------------------------------------------
// Sites
// ---------------------------------------------------------

export class SiteStatsRepository {
  async countByStatus(): Promise<Record<SiteStatus, number>> {
    const rows = await db
      .selectFrom("sites")
      .select(["status", db.fn.countAll().as("n")])
      .groupBy("status")
      .execute();

    const result = Object.values(SiteStatus).reduce(
      (acc, s) => ({ ...acc, [s]: 0 }),
      {} as Record<SiteStatus, number>
    );
    for (const r of rows) result[r.status as SiteStatus] = Number(r.n);
    return result;
  }

  async countExpiringBefore(date: Date): Promise<number> {
    const r = await db
      .selectFrom("sites")
      .select(db.fn.countAll().as("n"))
      .where("status", "=", SiteStatus.ACTIVE)
      .where("expires_at", ">", new Date())
      .where("expires_at", "<=", date)
      .executeTakeFirst();
    return Number(r?.n ?? 0);
  }

  async countCreatedBetween(range: IDateRange): Promise<number> {
    const r = await db
      .selectFrom("sites")
      .select(db.fn.countAll().as("n"))
      .where("created_at", ">=", range.from)
      .where("created_at", "<=", range.to)
      .executeTakeFirst();
    return Number(r?.n ?? 0);
  }

  // Cohorte : sites CRÉÉS dans la période ET payés (taux de conversion <= 100 %).
  async countPaidBetween(range: IDateRange): Promise<number> {
    const r = await db
      .selectFrom("sites")
      .select(db.fn.countAll().as("n"))
      .where("created_at", ">=", range.from)
      .where("created_at", "<=", range.to)
      .where("status", "in", PAID_SITE_STATUSES)
      .executeTakeFirst();
    return Number(r?.n ?? 0);
  }

  async forceExpire(siteId: string): Promise<void> {
    // Seul un site ACTIVE peut être expiré de force.
    const res = await db
      .updateTable("sites")
      .set({ status: SiteStatus.EXPIRED, expires_at: new Date() })
      .where("id", "=", siteId)
      .where("status", "=", SiteStatus.ACTIVE)
      .executeTakeFirst();

    if (Number(res.numUpdatedRows) === 0) {
      const exists = await db.selectFrom("sites").select("id").where("id", "=", siteId).executeTakeFirst();
      throw new BusinessRuleError(exists ? "SITE_NOT_ACTIVE" : "SITE_NOT_FOUND");
    }
  }
}

// ---------------------------------------------------------
// Paiements
// ---------------------------------------------------------

export class PaymentStatsRepository {
  async getRevenueStats(range: IDateRange): Promise<IRevenueStats> {
    const totals = await db
      .selectFrom("payments")
      .select([
        db.fn.countAll().as("count"),
        sql<number>`COALESCE(SUM(amount), 0)`.as("total"),
      ])
      .where("status", "=", "SUCCESS")
      .where("created_at", ">=", range.from)
      .where("created_at", "<=", range.to)
      .executeTakeFirst();

    const byMethodRows = await db
      .selectFrom("payments")
      .select(["method", sql<number>`COALESCE(SUM(amount), 0)`.as("total")])
      .where("status", "=", "SUCCESS")
      .where("created_at", ">=", range.from)
      .where("created_at", "<=", range.to)
      .groupBy("method")
      .execute();

    // Pas de colonne refunded_at : on se base sur updated_at (comme la procédure SQL).
    const refunded = await db
      .selectFrom("payments")
      .select(sql<number>`COALESCE(SUM(amount), 0)`.as("total"))
      .where("status", "=", "REFUNDED")
      .where("updated_at", ">=", range.from)
      .where("updated_at", "<=", range.to)
      .executeTakeFirst();

    const revenueByMethod = Object.values(PaymentMethod).reduce(
      (acc, m) => ({ ...acc, [m]: 0 }),
      {} as Record<PaymentMethod, number>
    );
    for (const r of byMethodRows) revenueByMethod[r.method as PaymentMethod] = Number(r.total);

    const paymentsCount = Number(totals?.count ?? 0);
    const totalRevenue = Number(totals?.total ?? 0);

    return {
      totalRevenue,
      revenueByMethod,
      paymentsCount,
      averageOrderValue: paymentsCount > 0 ? Math.round(totalRevenue / paymentsCount) : 0,
      refundedAmount: Number(refunded?.total ?? 0),
    };
  }

  async refund(paymentId: string, _reason: string): Promise<void> {
    // Le motif est conservé dans audit_logs (écrit par le service), pas dans payments.
    // WHERE status = 'SUCCESS' empêche le double remboursement.
    const res = await db
      .updateTable("payments")
      .set({ status: "REFUNDED" })
      .where("id", "=", paymentId)
      .where("status", "=", "SUCCESS")
      .executeTakeFirst();

    if (Number(res.numUpdatedRows) === 0) {
      const exists = await db.selectFrom("payments").select("id").where("id", "=", paymentId).executeTakeFirst();
      throw new BusinessRuleError(exists ? "PAYMENT_NOT_REFUNDABLE" : "PAYMENT_NOT_FOUND");
    }
  }
}

// ---------------------------------------------------------
// RSVP
// ---------------------------------------------------------

export class RsvpStatsRepository {
  async countAll(): Promise<number> {
    const r = await db.selectFrom("rsvps").select(db.fn.countAll().as("n")).executeTakeFirst();
    return Number(r?.n ?? 0);
  }
}

// ---------------------------------------------------------
// Templates
// ---------------------------------------------------------

export class TemplateStatsRepository {
  async getTopTemplates(range: IDateRange, limit: number): Promise<ITemplateStat[]> {
    // Tri par nombre d'achats (comme la procédure SQL), puis revenu en départage.
    const rows = await db
      .selectFrom("payments")
      .innerJoin("templates", "templates.id", "payments.template_id")
      .select([
        "templates.id as templateId",
        "templates.name as templateName",
        db.fn.countAll().as("purchaseCount"),
        sql<number>`COALESCE(SUM(payments.amount), 0)`.as("revenue"),
      ])
      .where("payments.status", "=", "SUCCESS")
      .where("payments.created_at", ">=", range.from)
      .where("payments.created_at", "<=", range.to)
      .groupBy(["templates.id", "templates.name"])
      .orderBy("purchaseCount", "desc")
      .orderBy("revenue", "desc")
      .limit(limit)
      .execute();

    return rows.map((r) => ({
      templateId: r.templateId,
      templateName: r.templateName,
      purchaseCount: Number(r.purchaseCount),
      revenue: Number(r.revenue),
    }));
  }
}

// ---------------------------------------------------------
// Audit
// ---------------------------------------------------------

export class AuditLogRepository {
  async log(
    adminId: string,
    action: AuditAction,
    targetId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await db
      .insertInto("audit_logs")
      .values({
        admin_id: adminId,
        action,
        target_id: targetId ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .execute();
  }
}

// ---------------------------------------------------------
// Métriques API
// ---------------------------------------------------------

export class ApiMetricsRepository {
  // Appelé par le middleware de logging des requêtes.
  async log(method: string, path: string, statusCode: number, durationMs: number): Promise<void> {
    await db
      .insertInto("api_request_logs")
      .values({ method, path, status_code: statusCode, duration_ms: durationMs })
      .execute();
  }

  async getMetrics(range: IDateRange): Promise<IApiMetrics> {
    const percentiles = await sql<{ p95: number | null; p99: number | null }>`
      WITH ranked AS (
        SELECT duration_ms, PERCENT_RANK() OVER (ORDER BY duration_ms) AS pr
        FROM api_request_logs
        WHERE created_at BETWEEN ${range.from} AND ${range.to}
      )
      SELECT
        MIN(CASE WHEN pr >= 0.95 THEN duration_ms END) AS p95,
        MIN(CASE WHEN pr >= 0.99 THEN duration_ms END) AS p99
      FROM ranked
    `.execute(db);

    const totals = await db
      .selectFrom("api_request_logs")
      .select(db.fn.countAll().as("total"))
      .select(sql<number>`COALESCE(SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END), 0)`.as("errors"))
      .where("created_at", ">=", range.from)
      .where("created_at", "<=", range.to)
      .executeTakeFirst();

    const byDayRows = await sql<{ day: string; total: number; errors: number }>`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
        COUNT(*) AS total,
        SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) AS errors
      FROM api_request_logs
      WHERE created_at BETWEEN ${range.from} AND ${range.to}
      GROUP BY day
      ORDER BY day
    `.execute(db);

    const totalRequests = Number(totals?.total ?? 0);
    const errorCount = Number(totals?.errors ?? 0);

    const requestsByDay: IApiRequestsByDay[] = byDayRows.rows.map((r) => ({
      date: r.day,
      requestCount: Number(r.total),
      errorCount: Number(r.errors),
    }));

    return {
      totalRequests,
      errorRate: totalRequests > 0 ? Math.round((errorCount / totalRequests) * 10000) / 100 : 0,
      p95LatencyMs: Number(percentiles.rows[0]?.p95 ?? 0),
      p99LatencyMs: Number(percentiles.rows[0]?.p99 ?? 0),
      requestsByDay,
    };
  }
}