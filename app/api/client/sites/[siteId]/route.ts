// ============ app/api/client/sites/[siteId]/route.ts ============
// Remplace app/api/client/sites/[id]/route.ts (à supprimer) : Next.js exige le
// même nom de segment dynamique à chaque niveau, et tout le dashboard utilise [siteId].
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSiteService } from "@/app/server/sites/site.container";
import { updateSiteCustomizationSchema } from "@/app/server/sites/SiteSchemaZod";
import { getClientIdOrNull, mapServiceError, unauthenticated } from "@/app/server/shared/apiAuth";

type Ctx = { params: Promise<{ siteId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const clientId = await getClientIdOrNull();
  if (!clientId) return unauthenticated();
  const { siteId } = await params;

  try {
    return NextResponse.json(await getSiteService().getSiteForEditing(clientId, siteId));
  } catch (error) {
    return mapServiceError(error);
  }
}

// PATCH : noms, date, couleurs, textes, programme. eventDate est refusée une
// fois le site ACTIVE (409 CANNOT_CHANGE_EVENT_DATE_AFTER_PAYMENT).
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const clientId = await getClientIdOrNull();
  if (!clientId) return unauthenticated();
  const { siteId } = await params;

  try {
    const body = await req.json();
    const parsed = updateSiteCustomizationSchema.parse({ ...body, siteId });
    const site = await getSiteService().updateCustomization(clientId, siteId, parsed);
    return NextResponse.json({ site });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: error.flatten() }, { status: 400 });
    }
    return mapServiceError(error);
  }
}