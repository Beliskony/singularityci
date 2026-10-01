// ============ app/api/client/sites/[siteId]/images/[imageId]/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getSiteService } from "@/app/server/sites/site.container";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string; imageId: string }> }
) {
  const { siteId, imageId } = await params; // deux paramètres dynamiques, tous deux dans la Promise

  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    return NextResponse.json({ error: "INVALID_SESSION" }, { status: 401 });
  }

  try {
    const siteService = getSiteService();
    await siteService.removeImage(session.clientId, siteId, imageId);
    return NextResponse.json({ message: "Image supprimée." });
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
    console.error("remove image error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}