// ============ sites/infra/ImageFile.repository.ts ============
import { sql } from "kysely";
import { db } from "../../config/Connection";

function firstResultSet<T>(raw: { rows: unknown }): T[] {
  const rows = raw.rows as any;
  if (Array.isArray(rows) && Array.isArray(rows[0])) return rows[0] as T[];
  return (rows ?? []) as T[];
}

export interface IImageFileMeta {
  id: string;
  siteId: string;
  mimeType: string;
  sizeBytes: number;
}

export class ImageFileRepository {
  async create(data: { id: string; siteId: string; mimeType: string; bytes: Buffer }): Promise<void> {
    await sql`
      CALL sp_image_file_create(${data.id}, ${data.siteId}, ${data.mimeType}, ${data.bytes.length}, ${data.bytes})
    `.execute(db);
  }

  async get(id: string): Promise<(IImageFileMeta & { bytes: Buffer }) | null> {
    const raw = await sql`CALL sp_image_file_get(${id})`.execute(db);
    const [row] = firstResultSet<any>(raw);
    if (!row) return null;
    return {
      id: row.id,
      siteId: row.site_id,
      mimeType: row.mime_type,
      sizeBytes: Number(row.size_bytes),
      bytes: Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data),
    };
  }

  async meta(id: string): Promise<IImageFileMeta | null> {
    const raw = await sql`CALL sp_image_file_meta(${id})`.execute(db);
    const [row] = firstResultSet<any>(raw);
    return row ? { id: row.id, siteId: row.site_id, mimeType: row.mime_type, sizeBytes: Number(row.size_bytes) } : null;
  }

  async delete(id: string): Promise<void> {
    await sql`CALL sp_image_file_delete(${id})`.execute(db);
  }

  async usageBySite(siteId: string): Promise<{ totalBytes: number; filesCount: number }> {
    const raw = await sql`CALL sp_image_file_usage_by_site(${siteId})`.execute(db);
    const [row] = firstResultSet<any>(raw);
    return { totalBytes: Number(row?.total_bytes ?? 0), filesCount: Number(row?.files_count ?? 0) };
  }
}

// "/api/images/<uuid>" → uuid, sinon null (image d'origine du template, lien externe…)
const IMAGE_URL = /^\/api\/images\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
export function imageFileIdFromUrl(url: string): string | null {
  return IMAGE_URL.exec(url)?.[1]?.toLowerCase() ?? null;
}