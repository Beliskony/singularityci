// ============ app/api/client/sites/[siteId]/uploads/route.ts ============
// POST multipart/form-data { file } → { url: "/api/images/<uuid>" }
// Stocke l'image dans la base. Le fichier n'est rattaché à rien tant qu'on ne l'a pas utilisé :
// soit comme photo (POST …/images), soit comme illustration (enregistrée dans customTexts).
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSiteService } from "@/app/server/sites/site.container";
import { ImageFileRepository } from "@/app/server/sites/infra/ImageFile.repository";
import { getClientIdOrNull, mapServiceError, unauthenticated } from "@/app/server/shared/apiAuth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ siteId: string }> };

const MAX_FILE_BYTES = 5 * 1024 * 1024; // le navigateur réduit déjà les images (~1 Mo)
const MAX_SITE_BYTES = 40 * 1024 * 1024; // quota total par site

// On ne se fie pas au type annoncé par le navigateur : on lit les premiers octets.
function sniffImageMime(b: Buffer): string | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.length > 12 && b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const clientId = await getClientIdOrNull();
  if (!clientId) return unauthenticated();
  const { siteId } = await params;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });
  if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = sniffImageMime(bytes);
  if (!mimeType) return NextResponse.json({ error: "UNSUPPORTED_IMAGE" }, { status: 415 });

  try {
    // Lève NotFound / Ownership si le site n'existe pas ou n'appartient pas au client.
    await getSiteService().getSiteForEditing(clientId, siteId);

    const files = new ImageFileRepository();
    const usage = await files.usageBySite(siteId);
    if (usage.totalBytes + bytes.length > MAX_SITE_BYTES) {
      return NextResponse.json({ error: "STORAGE_QUOTA_EXCEEDED" }, { status: 409 });
    }

    const id = randomUUID();
    await files.create({ id, siteId, mimeType, bytes });
    return NextResponse.json({ url: `/api/images/${id}` });
  } catch (error) {
    return mapServiceError(error);
  }
}