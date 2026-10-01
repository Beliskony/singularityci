// ============ app/api/admin/templates/[templateId]/deactivate/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IAdminAuthPayload } from "@/app/server/admin/IAdmin";
import { getTemplateService } from "@/app/server/templates/template.container";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(
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

  try {
    const templateService = getTemplateService();
    await templateService.deactivateTemplate(session, templateId);
    return NextResponse.json({ message: "Template désactivé du catalogue." });
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
    console.error("deactivate template error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}