// ============ app/api/client/sites/[siteId]/route.ts ============
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { NotFoundError, OwnershipError, BusinessRuleError } from "@/app/server/sites/Site.service";
import { getSiteService } from "@/app/server/sites/site.container";
import { updateSiteCustomizationSchema } from "@/app/server/sites/SiteSchemaZod";

const JWT_SECRET = process.env.JWT_SECRET!;

async function getClientIdOrNull(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) return null;
  try {
    const session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
    return session.clientId;
  } catch {
    return null;
  }
}

function mapServiceError(error: unknown): NextResponse {
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof OwnershipError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof BusinessRuleError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  console.error(error);
  return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
}

// GET : récupère le site + ses images + le schéma de champs du template
// (couleurs/textes/programme/images disponibles) pour remplir le formulaire.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const clientId = await getClientIdOrNull();
  if (!clientId) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { siteId } = await params;

  try {
    const data = await getSiteService().getSiteForEditing(clientId, siteId);
    return NextResponse.json(data);
  } catch (error) {
    return mapServiceError(error);
  }
}

// PATCH : applique les modifications de personnalisation (noms, date,
// couleurs, textes, programme). eventDate n'est accepté que si le site
// n'est pas encore ACTIVE — Site.service.ts rejette sinon avec
// CANNOT_CHANGE_EVENT_DATE_AFTER_PAYMENT (409), donc l'UI ne doit même
// pas l'envoyer une fois le site payé.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const clientId = await getClientIdOrNull();
  if (!clientId) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

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