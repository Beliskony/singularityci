// ============ admin/IAdminStats.types.ts ============
import { SiteStatus } from "../sites/ISite";
import { PaymentMethod } from "../payments/IPayment";

export interface IDateRange {
  from: Date;
  to: Date;
}

export interface IRevenueStats {
  totalRevenue: number;
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
  date: string;
  newClients: number;
}

export interface IDashboardStats {
  totalClients: number;
  newClientsInRange: number;
  sitesByStatus: Record<SiteStatus, number>;
  activeSitesCount: number;
  expiringSoonCount: number;
  totalRsvps: number;
  revenue: IRevenueStats;
  topTemplates: ITemplateStat[];
  conversionRate: number;
}

export interface IApiRequestsByDay {
  date: string;
  requestCount: number;
  errorCount: number;
}

export interface IApiMetrics {
  totalRequests: number;
  errorRate: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  requestsByDay: IApiRequestsByDay[];
}