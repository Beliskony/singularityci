// ============ rsvp/Rsvp.repository.ts ============
import { sql } from "kysely";
import { db } from "../config/Connection";
import { IRsvp, RsvpStatus } from "./IRsvp";
import { ISiteRsvpSummary } from "../client/IClient";

// Même convention que Site.repository.ts : mysql2 renvoie le résultat d'un CALL
// comme [ [rows...], OkPacket ], ce helper dépouille le premier result set.
function firstResultSet<T>(raw: { rows: unknown }): T[] {
  const rows = raw.rows as any;
  if (Array.isArray(rows) && Array.isArray(rows[0])) {
    return rows[0] as T[];
  }
  return (rows ?? []) as T[];
}

function mapRowToRsvp(row: any): IRsvp {
  return {
    id: row.id,
    siteId: row.site_id,
    guestName: row.guest_name,
    guestPhone: row.guest_phone ?? undefined,
    guestEmail: row.guest_email ?? undefined,
    numberOfGuests: row.guests_count,
    status: row.status as RsvpStatus,
    message: row.message ?? undefined,
    respondedAt: row.responded_at,
    createdAt: row.created_at,
  };
}

export class RsvpRepositoryImpl {
  // ---- utilisé par Rsvp.service.ts ----

  async findBySiteId(siteId: string): Promise<IRsvp[]> {
    const raw = await sql`CALL sp_rsvp_list_by_site(${siteId})`.execute(db);
    const rows = firstResultSet<any>(raw);
    return rows.map(mapRowToRsvp);
  }

  async findExisting(siteId: string, guestPhone?: string, guestEmail?: string): Promise<IRsvp | null> {
    const raw = await sql`
      CALL sp_rsvp_find_existing(${siteId}, ${guestPhone ?? null}, ${guestEmail ?? null})
    `.execute(db);
    const [row] = firstResultSet<any>(raw);
    return row ? mapRowToRsvp(row) : null;
  }

  async create(data: Partial<IRsvp>): Promise<IRsvp> {
    const raw = await sql`
      CALL sp_rsvp_create(${data.siteId}, ${data.guestName}, ${data.guestPhone ?? null},
        ${data.guestEmail ?? null}, ${data.status}, ${data.numberOfGuests ?? 1}, ${data.message ?? null})
    `.execute(db);
    const [row] = firstResultSet<any>(raw);
    return mapRowToRsvp(row);
  }

  async update(id: string, data: Partial<IRsvp>): Promise<IRsvp> {
    const raw = await sql`
      CALL sp_rsvp_update(${id}, ${data.guestName}, ${data.numberOfGuests}, ${data.status}, ${data.message ?? null})
    `.execute(db);
    const [row] = firstResultSet<any>(raw);
    return mapRowToRsvp(row);
  }

  // ---- utilisé par Client.service.ts (résumé agrégé, calculé en SQL) ----

  async getSummaryBySite(siteId: string): Promise<ISiteRsvpSummary> {
    const raw = await sql`CALL sp_rsvp_summary_by_site(${siteId})`.execute(db);
    const [row] = firstResultSet<any>(raw);

    return {
      submissionsCount: row?.total_responses ?? 0,
      confirmedGuestsCount: row?.total_guests_confirmed ?? 0,
      absentGuestsCount: row?.total_guests_declined ?? 0,
    };
  }
}