// ============ app/api/client/subdomain/route.ts ============
// GET /api/client/subdomain?value=junior-cynthia[&date=2026-08-28] → { available, valid, suggestions? }
// Si l'adresse est prise, propose des variantes libres (année, jour-mois de la date du mariage, numéro).
import { NextRequest, NextResponse } from "next/server";
import { getSiteService } from "@/app/server/sites/site.container";
import { getClientIdOrNull, unauthenticated } from "@/app/server/shared/apiAuth";

// 3 à 40 caractères, minuscules / chiffres / tirets, ni début ni fin par un tiret.
export const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/;
const RESERVED = new Set(["www", "app", "api", "admin", "dashboard", "mail", "static", "assets"]);

export async function GET(req: NextRequest) {
  if (!(await getClientIdOrNull())) return unauthenticated();

  const value = (req.nextUrl.searchParams.get("value") ?? "").toLowerCase().trim();
  if (!SUBDOMAIN_REGEX.test(value) || RESERVED.has(value)) {
    return NextResponse.json({ valid: false, available: false });
  }

  try {
    const service = getSiteService();
    const available = await service.checkSubdomainAvailability(value);
    if (available) return NextResponse.json({ valid: true, available: true });

    // Variantes : la date du mariage rend l'adresse parlante (axel-houria-2026, axel-houria-0828),
    // puis un numéro en dernier recours. On ne renvoie que des adresses vérifiées libres.
    const date = req.nextUrl.searchParams.get("date") ?? "";
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const candidates = [
      ...(m ? [`${value}-${m[1]}`, `${value}-${m[3]}${m[2]}`, `${value}-${m[1]}${m[2]}${m[3]}`] : []),
      `${value}-2`,
      `${value}-3`,
    ].filter((c) => SUBDOMAIN_REGEX.test(c) && !RESERVED.has(c));

    const suggestions: string[] = [];
    for (const c of candidates) {
      if (suggestions.length >= 3) break;
      if (await service.checkSubdomainAvailability(c)) suggestions.push(c);
    }
    return NextResponse.json({ valid: true, available: false, suggestions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}