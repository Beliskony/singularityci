// ============ app/api/client/subdomain/route.ts ============
// GET /api/client/subdomain?value=junior-cynthia → { available, valid }
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
    const available = await getSiteService().checkSubdomainAvailability(value);
    return NextResponse.json({ valid: true, available });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}