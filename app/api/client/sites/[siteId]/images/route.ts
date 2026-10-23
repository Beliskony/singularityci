// ============ app/api/client/sites/[siteId]/images/route.ts ============
// POST { url, role } → rattache une image déjà envoyée (…/images/uploads) à un rôle HERO / GALLERY / VENUE
// (le retrait d'une photo reste dans …/images/[imageId]/route.ts, DELETE)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSiteService } from "@/app/server/sites/site.container";
import { SiteImageRole } from "@/app/server/sites/ISite";
import { ImageFileRepository, imageFileIdFromUrl } from "@/app/server/sites/infra/ImageFile.repository";
import { getClientIdOrNull, mapServiceError, unauthenticated } from "@/app/server/shared/apiAuth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ siteId: string }> };

const addSchema = z.object({
  url: z.string().trim().max(500),
  role: z.nativeEnum(SiteImageRole),
});

export async function POST(req: NextRequest, { params }: Ctx) {
  const clientId = await getClientIdOrNull();
  if (!clientId) return unauthenticated();
  const { siteId } = await params;

  const parsed = addSchema.safeParse(await req.json().catch(() => null));
  const fileId = parsed.success ? imageFileIdFromUrl(parsed.data.url) : null;
  if (!parsed.success || !fileId) return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });

  try {
    // Le fichier doit avoir été envoyé pour CE site : on n'attache pas l'image d'un autre.
    const meta = await new ImageFileRepository().meta(fileId);
    if (!meta || meta.siteId !== siteId) return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });

    const image = await getSiteService().addImage(clientId, siteId, parsed.data.url, parsed.data.role);
    return NextResponse.json({ image });
  } catch (error) {
    return mapServiceError(error);
  }
}