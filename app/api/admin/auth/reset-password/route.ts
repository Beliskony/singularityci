// ============ app/api/admin/auth/reset-password/route.ts ============
import { NextResponse } from "next/server";
import { adminResetPasswordSchema } from "@/app/server/admin/AdminSchemaZod";
import { getAuthAdminService } from "@/app/server/authAdmin/authAdmin.container";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = adminResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const authAdminService = getAuthAdminService();
    await authAdminService.resetPassword(parsed.data.token, parsed.data.newPassword);
    return NextResponse.json({ message: "Mot de passe réinitialisé." });
  } catch (err) {
    if (err instanceof Error && err.name === "BusinessRuleError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("admin reset-password error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}