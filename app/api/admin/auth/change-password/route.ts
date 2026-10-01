// ============ app/api/admin/auth/change-password/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { adminChangePasswordSchema } from "@/app/server/admin/AdminSchemaZod";
import { IAdminAuthPayload } from "@/app/server/admin/IAdmin";
import { getAuthAdminService } from "@/app/server/authAdmin/authAdmin.container";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  // Vérification de session : dupliquée route par route (pas de fichier shared)
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  let payload: IAdminAuthPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as IAdminAuthPayload;
  } catch {
    return NextResponse.json({ error: "INVALID_SESSION" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = adminChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const authAdminService = getAuthAdminService();
    await authAdminService.changePassword(payload.adminId, parsed.data);
    return NextResponse.json({ message: "Mot de passe mis à jour." });
  } catch (err) {
    if (err instanceof Error && err.name === "BusinessRuleError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("admin change-password error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}