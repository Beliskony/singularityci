// ============ app/api/admin/templates/[templateId]/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { updateTemplateSchema } from "@/app/server/templates/TemplateSchemaZod";
import { IAdminAuthPayload } from "@/app/server/admin/IAdmin";
import { getTemplateService } from "@/app/server/templates/template.container";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  let session: IAdminAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IAdminAuthPayload;
  } catch {
    return NextResponse.json({ error: "INVALID_SESSION" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = updateTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const templateService = getTemplateService();
    const template = await templateService.updateTemplate(session, templateId, parsed.data);
    return NextResponse.json({ template });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "ForbiddenError":
          return NextResponse.json({ error: err.message }, { status: 403 });
        case "NotFoundError":
          return NextResponse.json({ error: err.message }, { status: 404 });
        default:
          break;
      }
    }
    console.error("update template error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}