// ============ app/api/public/sites/[siteId]/rsvp/route.ts ============
import { NextResponse } from "next/server";
import { submitRsvpSchema } from "@/app/server/rsvp/RsvpSchemaZod";
import { getRsvpService } from "@/app/server/rsvp/rsvp.container";

// Route publique, volontairement sans authentification : n'importe quel invité
// avec le lien du site doit pouvoir répondre au RSVP
export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = submitRsvpSchema.safeParse({ ...(body as object), siteId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const rsvpService = getRsvpService();
    const rsvp = await rsvpService.submitRsvp(parsed.data);
    return NextResponse.json({ rsvp }, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "NotFoundError":
          return NextResponse.json({ error: err.message }, { status: 404 });
        case "BusinessRuleError":
          return NextResponse.json({ error: err.message }, { status: 400 });
        default:
          break;
      }
    }
    console.error("submit rsvp error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}