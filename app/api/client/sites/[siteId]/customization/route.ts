// ============ app/api/client/sites/[siteId]/customization/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { updateSiteCustomizationSchema } from "@/app/server/sites/SiteSchemaZod";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getSiteService } from "@/app/server/sites/site.container";

const JWT_SECRET = process.env.JWT_SECRET!;

async function requireClient(): Promise<IClientAuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    return null;
  }
}

// Le dashboard appelle ceci EN PREMIER pour savoir quels champs afficher
export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  const session = await requireClient();
  if (!session) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  try {
    const siteService = getSiteService();
    const schema = await siteService.getCustomizationSchema(session.clientId, siteId);
    return NextResponse.json({ schema });
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
    console.error("get customization schema error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  const session = await requireClient();
  if (!session) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  // siteId vient de l'URL, on l'injecte dans le body avant validation (le schéma le requiert)
  const parsed = updateSiteCustomizationSchema.safeParse({ ...body as object, siteId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const siteService = getSiteService();
    const site = await siteService.updateCustomization(session.clientId, siteId, parsed.data);
    return NextResponse.json({ site });
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
    console.error("update customization error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}