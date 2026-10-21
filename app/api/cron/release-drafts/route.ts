// ============ app/api/cron/release-drafts/route.ts ============
// Appelée une fois par jour par un cron (cPanel, cron-job.org, Vercel Cron…) avec l'en-tête
//   Authorization: Bearer <CRON_SECRET>
// Libère les brouillons impayés de plus de 3 jours.
import { NextRequest, NextResponse } from "next/server";
import { sql } from "kysely";
import { db } from "@/app/server/config/Connection";

const DRAFT_TTL_DAYS = 3;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const raw = await sql`CALL sp_site_release_expired_drafts(${DRAFT_TTL_DAYS})`.execute(db);
    const rows = raw.rows as any;
    const first = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0][0] : rows?.[0];
    return NextResponse.json({ released: Number(first?.released ?? 0) });
  } catch (err) {
    console.error("[cron release-drafts]", err);
    return NextResponse.json({ error: "RELEASE_FAILED" }, { status: 500 });
  }
}