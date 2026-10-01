// ============ admin/IAdmin.ts ============
import { SiteStatus } from "../sites/ISite";
import { PaymentMethod } from "../payments/IPayment";


export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  MODERATOR = "MODERATOR",
}

export enum AdminPermission {
  MANAGE_ADMINS = "MANAGE_ADMINS",
  MANAGE_TEMPLATES = "MANAGE_TEMPLATES",
  MANAGE_CLIENTS = "MANAGE_CLIENTS",
  MANAGE_SITES = "MANAGE_SITES",
  MANAGE_PAYMENTS = "MANAGE_PAYMENTS",
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
}

export enum AuditAction {
  CREATE_MODERATOR = "CREATE_MODERATOR",
  UPDATE_PERMISSIONS = "UPDATE_PERMISSIONS",
  DEACTIVATE_ADMIN = "DEACTIVATE_ADMIN",
  REACTIVATE_ADMIN = "REACTIVATE_ADMIN",
  FORCE_EXPIRE_SITE = "FORCE_EXPIRE_SITE",
  REFUND_PAYMENT = "REFUND_PAYMENT",
}

export interface IAdmin {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: AdminRole;
  permissions: AdminPermission[]; // ignoré si role === SUPER_ADMIN
  isActive: boolean;
  createdBy?: string;
  lastLoginAt?: Date;
  failedLoginAttempts: number;   // reset à 0 dès qu'une connexion réussit
  lockedUntil?: Date;          
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminAuthPayload {
  adminId: string;
  role: AdminRole;
  permissions: AdminPermission[];
}

export interface IAuditLog {
  id: string;
  adminId: string;
  action: AuditAction;
  targetId?: string;      // id de l'entité affectée (admin, site, paiement...)
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ============ Admin Stats ============


export interface IDateRange {
  from: Date;
  to: Date;
}

export interface IRevenueStats {
  totalRevenue: number;           // en XOF
  revenueByMethod: Record<PaymentMethod, number>;
  paymentsCount: number;
  averageOrderValue: number;
  refundedAmount: number;
}

export interface ITemplateStat {
  templateId: string;
  templateName: string;
  purchaseCount: number;
  revenue: number;
}

export interface IClientGrowthPoint {
  date: string; // YYYY-MM-DD
  newClients: number;
}

export interface IDashboardStats {
  totalClients: number;
  newClientsInRange: number;
  sitesByStatus: Record<SiteStatus, number>;
  activeSitesCount: number;
  expiringSoonCount: number;      // sites actifs dont expiresAt < 7 jours
  totalRsvps: number;
  revenue: IRevenueStats;
  topTemplates: ITemplateStat[];
  conversionRate: number;         // sites payés / sites créés (DRAFT inclus), sur la période
}