// ============ app/api/images/[id]/route.ts ============
// GET public : sert une image stockée en base. Publique car elle s'affiche sur le site des mariés.
// L'identifiant est un UUID aléatoire ; le contenu est immuable, donc cache longue durée.
import { NextRequest, NextResponse } from "next/server";
import { ImageFileRepository } from "@/app/server/sites/infra/ImageFile.repository";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return new NextResponse(null, { status: 404 });

  const etag = `"${id.toLowerCase()}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  const file = await new ImageFileRepository().get(id.toLowerCase());
  if (!file) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; sandbox",
    },
  });
}