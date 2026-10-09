// ============ sites/Site.repository.ts ============
import { sql } from "kysely";
import { db } from "../config/Connection";
import { ISite, ISiteImage, SiteStatus, SiteImageRole } from "./ISite";

// mysql2 renvoie le résultat d'un CALL comme [ [rows...], OkPacket ] plutôt que
// comme un tableau de lignes plat (le cas pour un SELECT classique via Kysely).
// Ce helper centralise le dépouillement pour que tous les repositories basés
// sur des procédures stockées restent cohérents — si ta version de Connection.ts
// enveloppe le driver différemment, c'est ici qu'il faut ajuster.
function firstResultSet<T>(raw: { rows: unknown }): T[] {
  const rows = raw.rows as any;
  if (Array.isArray(rows) && Array.isArray(rows[0])) {
    return rows[0] as T[];
  }
  return (rows ?? []) as T[];
}

function mapRowToSite(row: any): ISite {
  return {
    id: row.id,
    clientId: row.client_id,
    templateId: row.template_id,
    subdomain: row.subdomain,
    groomName: row.groom_name,
    brideName: row.bride_name,
    eventDate: row.event_date,
    images: [], // chargées séparément via SiteImageRepository, jamais par ce mapping
    themeColors: row.theme_colors ?? undefined,
    customTexts: row.custom_texts ?? undefined,
    programItems: row.program_items ?? undefined,
    status: row.status as SiteStatus,
    purchasedAt: row.activated_at ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    lastPaymentId: row.last_payment_id ?? undefined,
    rsvpCount: row.rsvp_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToSiteImage(row: any): ISiteImage {
  return {
    id: row.id,
    siteId: row.site_id,
    url: row.url,
    role: row.role as SiteImageRole,
    position: row.sort_order,
    uploadedAt: row.created_at,
  };
}

export class SiteRepositoryImpl {
  // ---- utilisé par Site.service.ts ----

  async create(data: Partial<ISite>): Promise<ISite> {
    const raw = await sql`
      CALL sp_site_create_draft(${data.clientId}, ${data.templateId}, ${data.subdomain},
        ${data.groomName}, ${data.brideName}, ${data.eventDate})
    `.execute(db);
    const [row] = firstResultSet<any>(raw);
    return mapRowToSite(row);
  }

  async findById(id: string): Promise<ISite | null> {
    const raw = await sql`CALL sp_site_find_by_id(${id})`.execute(db);
    const [row] = firstResultSet<any>(raw);
    return row ? mapRowToSite(row) : null;
  }

  async findBySubdomain(subdomain: string): Promise<ISite | null> {
    const raw = await sql`CALL sp_site_find_by_subdomain(${subdomain})`.execute(db);
    const [row] = firstResultSet<any>(raw);
    return row ? mapRowToSite(row) : null;
  }

  async update(id: string, data: Partial<ISite>): Promise<ISite> {
    // Les transitions de statut dédiées (activate/expire/archive) passent par
    // leurs propres procédures ; cette méthode générique ne touche que la
    // personnalisation (noms, date, couleurs, textes, programme).
    await sql`
      CALL sp_site_update_customization(${id}, ${data.groomName}, ${data.brideName}, ${data.eventDate},
        ${data.themeColors ? JSON.stringify(data.themeColors) : null},
        ${data.customTexts ? JSON.stringify(data.customTexts) : null},
        ${data.programItems ? JSON.stringify(data.programItems) : null})
    `.execute(db);

    const updated = await this.findById(id);
    if (!updated) throw new Error("SITE_NOT_FOUND_AFTER_UPDATE");
    return updated;
  }

  async updateStatus(id: string, status: SiteStatus, extra?: Partial<ISite>): Promise<void> {
    switch (status) {
      case SiteStatus.ACTIVE:
        await sql`CALL sp_site_activate(${id}, ${extra?.expiresAt ?? null})`.execute(db);
        break;
      case SiteStatus.EXPIRED:
        await sql`CALL sp_site_expire(${id})`.execute(db);
        break;
      case SiteStatus.ARCHIVED:
        await sql`CALL sp_site_archive(${id})`.execute(db);
        break;
      default:
        throw new Error(`UNSUPPORTED_STATUS_TRANSITION: ${status}`);
    }
  }

  // ---- utilisé par Client.service.ts ----

  async findByClientId(clientId: string): Promise<ISite[]> {
    const raw = await sql`CALL sp_site_list_by_client(${clientId})`.execute(db);
    const rows = firstResultSet<any>(raw);
    return rows.map(mapRowToSite);
  }

  async countByClientAndStatus(clientId: string, statuses: SiteStatus[]): Promise<number> {
    const csv = statuses.join(",");
    const raw = await sql`CALL sp_site_count_by_client_and_status(${clientId}, ${csv})`.execute(db);
    const [row] = firstResultSet<any>(raw);
    return row?.total ?? 0;
  }

  // ---- utilisé par Rsvp.service.ts ----

  async incrementRsvpCount(siteId: string, delta: number): Promise<void> {
    await sql`CALL sp_site_increment_rsvp_count(${siteId}, ${delta})`.execute(db);
  }
}


export class SiteImageRepositoryImpl {
  async findBySiteId(siteId: string): Promise<ISiteImage[]> {
    const raw = await sql`CALL sp_site_image_list_by_site(${siteId}, ${null})`.execute(db);
    const rows = firstResultSet<any>(raw);
    return rows.map(mapRowToSiteImage);
  }

  async add(data: Partial<ISiteImage>): Promise<ISiteImage> {
    const raw = await sql`
      CALL sp_site_image_add(${data.siteId}, ${data.role}, ${data.url}, ${data.position ?? 0})
    `.execute(db);
    const [row] = firstResultSet<any>(raw);
    return mapRowToSiteImage(row);
  }

  async remove(imageId: string): Promise<void> {
    await sql`CALL sp_site_image_remove(${imageId})`.execute(db);
  }

  async reorder(siteId: string, role: SiteImageRole, orderedImageIds: string[]): Promise<void> {
    // sp_site_image_reorder ne traite qu'une image à la fois : on applique
    // l'ordre voulu séquentiellement (position = index dans le tableau fourni).
    await Promise.all(
      orderedImageIds.map((imageId, index) => sql`CALL sp_site_image_reorder(${imageId}, ${index})`.execute(db))
    );
  }

  async deleteAllBySiteId(siteId: string): Promise<void> {
    const images = await this.findBySiteId(siteId);
    await Promise.all(images.map((img) => sql`CALL sp_site_image_remove(${img.id})`.execute(db)));
  }
}