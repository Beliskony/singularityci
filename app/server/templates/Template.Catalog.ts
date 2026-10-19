// ============ app/server/templates/Template.Catalog.ts ============
// Lecture du catalogue pour la page d'achat. Passe par la procédure stockée
// existante sp_template_find_by_slug (aucun SQL inline).
import { sql } from "kysely";
import { db } from "@/app/server/config/Connection";

export interface ITemplateListing {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceXof: number;
}

function firstResultSet<T>(raw: { rows: unknown }): T[] {
  const rows = raw.rows as any;
  if (Array.isArray(rows) && Array.isArray(rows[0])) return rows[0] as T[];
  return (rows ?? []) as T[];
}

// Renvoie null si le slug est inconnu OU si le template est désactivé :
// un template retiré de la vente ne doit pas pouvoir être acheté par URL directe.
export async function findActiveTemplateBySlug(slug: string): Promise<ITemplateListing | null> {
  const raw = await sql`CALL sp_template_find_by_slug(${slug})`.execute(db);
  const [row] = firstResultSet<any>(raw);
  if (!row) return null;

  const isActive = row.is_active === undefined ? true : Boolean(row.is_active);
  if (!isActive) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    // Les deux versions du schéma coexistent dans tes scripts : `price_xof` (v4) ou `price` (v3).
    priceXof: Number(row.price_xof ?? row.price),
  };
}