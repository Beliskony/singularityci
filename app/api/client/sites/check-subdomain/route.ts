// ============ app/api/client/sites/check-subdomain/route.ts ============
import { NextResponse } from "next/server";
import { checkSubdomainAvailabilitySchema } from "@/app/server/sites/SiteSchemaZod";
import { getSiteService } from "@/app/server/sites/site.container";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = checkSubdomainAvailabilitySchema.safeParse({
    subdomain: searchParams.get("subdomain"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const siteService = getSiteService();
    const available = await siteService.checkSubdomainAvailability(parsed.data.subdomain);
    return NextResponse.json({ available });
  } catch (err) {
    console.error("check subdomain error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}