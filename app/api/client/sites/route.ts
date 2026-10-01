// ============ app/api/client/sites/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";
import { getSiteService } from "@/app/server/sites/site.container";
import { createSiteSchema } from "@/app/server/sites/SiteSchemaZod";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
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
    const sites = await clientService.listMySites(session.clientId);
    return NextResponse.json({ sites });
  } catch (err) {
    console.error("list sites error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

  const parsed = createSiteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const siteService = getSiteService();
    const site = await siteService.createDraftSite(session.clientId, parsed.data);
    return NextResponse.json({ site }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === "BusinessRuleError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("create site error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}