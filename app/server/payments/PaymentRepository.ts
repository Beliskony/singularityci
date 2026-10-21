// ============ app/server/payments/PaymentRepository.ts ============
import { randomUUID } from "crypto";
import { db } from "../config/Connection"; // ton instance Kysely
import { IPayment, PaymentMethod, PaymentStatus } from "./IPayment";
import { SiteStatus } from "../sites/ISite";

// La table `payments` utilise `amount_xof` et un enum de statut propre à FedaPay
// (APPROVED / DECLINED / CANCELED) : le repository traduit vers/depuis le vocabulaire du service
// (SUCCESS / FAILED) pour que Payment.service n'ait rien à savoir du schéma SQL.
function statusFromDb(s: string): PaymentStatus {
  switch (s) {
    case "APPROVED":
    case "TRANSFERRED":
      return PaymentStatus.SUCCESS;
    case "DECLINED":
    case "CANCELED":
    case "CANCELLED":
      return PaymentStatus.FAILED;
    case "REFUNDED":
      return PaymentStatus.REFUNDED;
    default:
      return PaymentStatus.PENDING;
  }
}

function statusToDb(s: PaymentStatus): string {
  switch (s) {
    case PaymentStatus.SUCCESS:
      return "APPROVED";
    case PaymentStatus.FAILED:
      return "DECLINED";
    case PaymentStatus.REFUNDED:
      return "REFUNDED";
    default:
      return "PENDING";
  }
}

// ---- mapping ligne SQL -> IPayment ----
function toPayment(row: any): IPayment {
  return {
    id: row.id,
    siteId: row.site_id,
    clientId: row.client_id,
    templateId: row.template_id ?? "",
    amount: Number(row.amount_xof),
    currency: "XOF",
    method: (row.method ?? PaymentMethod.MOBILE_MONEY) as PaymentMethod,
    provider: row.provider ?? "",
    providerTransactionRef: row.provider_transaction_ref ?? "",
    status: statusFromDb(String(row.status)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class KyselyPaymentRepository {
  async create(data: Partial<IPayment>): Promise<IPayment> {
    // MariaDB + Kysely mysql dialect : pas de RETURNING, on génère l'id nous-mêmes
    const id = randomUUID();
    try {
      await (db as any)
      .insertInto("payments")
      .values({
        id,
        site_id: data.siteId!,
        client_id: data.clientId!,
        template_id: data.templateId!,
        amount_xof: data.amount!,
        method: data.method!,
        // `provider` est NOT NULL (défaut FEDAPAY) : on ne l'envoie pas ici,
        // attachProviderRef le renseigne juste après l'appel au provider.
        // NULL et non "" pour la ref : évite de violer un éventuel index UNIQUE
        provider_transaction_ref: data.providerTransactionRef || null,
        status: statusToDb(data.status ?? PaymentStatus.PENDING),
        // Garde d'unicité « un seul PENDING par site » (index UNIQUE sur cette colonne)
        pending_site_id: (data.status ?? PaymentStatus.PENDING) === PaymentStatus.PENDING ? data.siteId! : null,
      })
      .execute();
    } catch (err: any) {
      // Index unique « un seul PENDING par site » : double clic / deux onglets simultanés.
      if (err?.code === "ER_DUP_ENTRY") {
        const e = new Error("PAYMENT_ALREADY_IN_PROGRESS");
        e.name = "BusinessRuleError"; // reconnu par nom dans les routes (409)
        throw e;
      }
      throw err;
    }

    const created = await this.findById(id);
    if (!created) throw new Error("PAYMENT_CREATE_FAILED");
    return created;
  }

  async findById(id: string): Promise<IPayment | null> {
    const row = await db.selectFrom("payments").selectAll().where("id", "=", id).executeTakeFirst();
    return row ? toPayment(row) : null;
  }

  async findByProviderRef(ref: string): Promise<IPayment | null> {
    if (!ref) return null; // une ref vide ne doit jamais matcher
    const row = await db
      .selectFrom("payments")
      .selectAll()
      .where("provider_transaction_ref", "=", ref)
      .executeTakeFirst();
    return row ? toPayment(row) : null;
  }

  async findLatestBySite(siteId: string): Promise<IPayment | null> {
    const row = await db
      .selectFrom("payments")
      .selectAll()
      .where("site_id", "=", siteId)
      .orderBy("created_at", "desc")
      .limit(1)
      .executeTakeFirst();
    return row ? toPayment(row) : null;
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<void> {
    await (db as any).updateTable("payments").set({
        status: statusToDb(status),
        // dès que le paiement n'est plus PENDING, le site est de nouveau libre pour un nouvel essai
        ...(status !== PaymentStatus.PENDING ? { pending_site_id: null } : {}),
      }).where("id", "=", id).execute();
  }

  async attachProviderRef(id: string, provider: string, ref: string): Promise<void> {
    await (db as any)
      .updateTable("payments")
      .set({ provider, provider_transaction_ref: ref })
      .where("id", "=", id)
      .execute();
  }
}

// ---- Lecture seule des sites (le service n'a pas besoin du repo complet) ----
export class KyselySiteReadRepository {
  async findById(siteId: string) {
    const row = await db
      .selectFrom("sites")
      .select(["id", "client_id", "status", "template_id"])
      .where("id", "=", siteId)
      .executeTakeFirst();
    if (!row) return null;
    return {
      id: row.id as string,
      clientId: row.client_id as string,
      status: row.status as SiteStatus,
      templateId: row.template_id as string,
    };
  }
}

// ---- Prix des templates ----
export class KyselyTemplateRepository {
  async getPrice(templateId: string): Promise<number | null> {
    const row = await (db as any)
      .selectFrom("templates")
      .select(["price_xof"])
      .where("id", "=", templateId)
      .where("is_active", "=", true) // template inactif => TEMPLATE_NOT_AVAILABLE
      .executeTakeFirst();
    return row ? Number(row.price_xof) : null;
  }
}