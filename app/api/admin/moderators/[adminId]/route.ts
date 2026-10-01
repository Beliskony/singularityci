// ============ app/api/admin/moderators/[adminId]/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IAdminAuthPayload } from "@/app/server/admin/IAdmin";
import { getAdminService } from "@/app/server/admin/admin.container";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ adminId: string }> }
) {
  const { adminId } = await params;

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
    const adminService = getAdminService();
    await adminService.deactivateAdmin(session, adminId);
    return NextResponse.json({ message: "Modérateur désactivé." });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "ForbiddenError":
          return NextResponse.json({ error: err.message }, { status: 403 });
        case "BusinessRuleError":
          return NextResponse.json({ error: err.message }, { status: 400 });
        default:
          break;
      }
    }
    console.error("deactivate admin error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}