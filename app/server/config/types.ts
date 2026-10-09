// ============ server/database/types.ts ============
import { Generated, ColumnType } from "kysely";

export interface ClientsTable {
  id: Generated<string>;
  email: string;
  phone: string | null;
  password_hash: string | null;
  google_id: string | null;
  full_name: string;
  is_email_verified: Generated<boolean>;
  is_phone_verified: Generated<boolean>;
  failed_login_attempts: Generated<number>;
  locked_until: Date | null;
  deleted_at: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface AdminsTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  full_name: string;
  role: "SUPER_ADMIN" | "MODERATOR";
  permissions: ColumnType<string, string, string>;
  is_active: Generated<boolean>;
  created_by: string | null;
  last_login_at: Date | null;
  failed_login_attempts: Generated<number>;
  locked_until: Date | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface OtpsTable {
  id: Generated<string>;
  client_id: string;
  code_hash: string;
  purpose: "REGISTER" | "LOGIN" | "PASSWORD_RESET";
  expires_at: Date;
  consumed_at: Date | null;
  created_at: Generated<Date>;
}

export interface TemplatesTable {
  id: Generated<string>;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  preview_images: ColumnType<string, string, string>;
  is_active: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface SitesTable {
  id: Generated<string>;
  client_id: string;
  template_id: string;
  subdomain: string;
  groom_name: string;
  bride_name: string;
  event_date: Date;
  theme_colors: ColumnType<string | null, string | null, string | null>;
  custom_texts: ColumnType<string | null, string | null, string | null>;
  program_items: ColumnType<string | null, string | null, string | null>;
  status: "DRAFT" | "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "ARCHIVED";
  purchased_at: Date | null;
  expires_at: Date | null;
  archived_at: Date | null;
  last_payment_id: string | null;
  rsvp_count: Generated<number>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface SiteImagesTable {
  id: Generated<string>;
  site_id: string;
  url: string;
  role: "HERO" | "GALLERY" | "VENUE";
  position: number;
  uploaded_at: Generated<Date>;
}

export interface PaymentsTable {
  id: Generated<string>;
  site_id: string;
  client_id: string;
  template_id: string;
  amount: number;
  currency: string;
  method: "MOBILE_MONEY" | "CARD";
  provider: string;
  provider_transaction_ref: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface RsvpsTable {
  id: Generated<string>;
  site_id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  number_of_guests: number;
  status: "ATTENDING" | "NOT_ATTENDING" | "PENDING";
  message: string | null;
  responded_at: Generated<Date>;
}

export interface AdminPasswordResetsTable {
  id: Generated<string>;
  admin_id: string;
  token_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
  created_at: Generated<Date>;
}

export interface AuditLogsTable {
  id: Generated<string>;
  admin_id: string;
  action: string;
  target_id: string | null;
  metadata: ColumnType<string | null, string | null, string | null>;
  created_at: Generated<Date>;
}

export interface ApiRequestLogsTable {
  id: Generated<number>;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  created_at: Generated<Date>;
}

export interface Database {
  clients: ClientsTable;
  admins: AdminsTable;
  otps: OtpsTable;
  templates: TemplatesTable;
  sites: SitesTable;
  site_images: SiteImagesTable;
  payments: PaymentsTable;
  rsvps: RsvpsTable;
  admin_password_resets: AdminPasswordResetsTable;
  audit_logs: AuditLogsTable;
  api_request_logs: ApiRequestLogsTable;
}