// ============ app/api/client/sites/[siteId]/images/reorder/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { SiteImageRole } from "@/app/server/sites/ISite";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getSiteService } from "@/app/server/sites/site.container";

const JWT_SECRET = process.env.JWT_SECRET!;

const reorderSchema = z.object({
  role: z.nativeEnum(SiteImageRole),
  orderedImageIds: z.array(z.string().uuid()).min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    return NextResponse.json({ error: "INVALID_SESSION" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const siteService = getSiteService();
    await siteService.reorderImages(
      session.clientId,
      siteId,
      parsed.data.role,
      parsed.data.orderedImageIds
    );
    return NextResponse.json({ message: "Ordre mis à jour." });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "NotFoundError":
          return NextResponse.json({ error: err.message }, { status: 404 });
        case "OwnershipError":
          return NextResponse.json({ error: err.message }, { status: 403 });
        case "BusinessRuleError":
          return NextResponse.json({ error: err.message }, { status: 400 });
        default:
          break;
      }
    }
    console.error("reorder images error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}