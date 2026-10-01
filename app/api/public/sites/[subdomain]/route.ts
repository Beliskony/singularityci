// ============ app/api/public/sites/[subdomain]/route.ts ============
import { NextResponse } from "next/server";
import { getSiteService } from "@/app/server/sites/site.container";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;

  try {
    const siteService = getSiteService();
    const site = await siteService.findPublicSiteBySubdomain(subdomain);

    if (!site) {
      return NextResponse.json({ error: "SITE_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (err) {
    console.error("public site error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}