// ============ app/api/client/sites/[siteId]/rsvp-summary/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(
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

  try {
    const clientService = getClientService();
    const summary = await clientService.getSiteRsvpSummary(session.clientId, siteId);
    return NextResponse.json({ summary });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "NotFoundError":
          return NextResponse.json({ error: err.message }, { status: 404 });
        case "OwnershipError":
          return NextResponse.json({ error: err.message }, { status: 403 });
        default:
          break;
      }
    }
    console.error("rsvp summary error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}