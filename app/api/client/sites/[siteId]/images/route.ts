// ============ app/api/client/sites/[siteId]/images/route.ts ============
// POST   { url, role }        → ajoute une photo (lien https) à un rôle HERO / GALLERY / VENUE
// DELETE ?imageId=<uuid>      → retire une photo
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSiteService } from "@/app/server/sites/site.container";
import { SiteImageRole } from "@/app/server/sites/ISite";
import { getClientIdOrNull, mapServiceError, unauthenticated } from "@/app/server/shared/apiAuth";

type Ctx = { params: Promise<{ siteId: string }> };

const addSchema = z.object({
  url: z.string().trim().max(500).url().refine((u) => /^https:\/\//i.test(u), "Le lien doit commencer par https://"),
  role: z.nativeEnum(SiteImageRole),
});

export async function POST(req: NextRequest, { params }: Ctx) {
  const clientId = await getClientIdOrNull();
  if (!clientId) return unauthenticated();
  const { siteId } = await params;

  const parsed = addSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });

  try {
    const image = await getSiteService().addImage(clientId, siteId, parsed.data.url, parsed.data.role);
    return NextResponse.json({ image });
  } catch (error) {
    return mapServiceError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const clientId = await getClientIdOrNull();
  if (!clientId) return unauthenticated();
  const { siteId } = await params;

  const imageId = req.nextUrl.searchParams.get("imageId") ?? "";
  if (!z.string().uuid().safeParse(imageId).success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });
  }

  try {
    await getSiteService().removeImage(clientId, siteId, imageId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return mapServiceError(error);
  }
}