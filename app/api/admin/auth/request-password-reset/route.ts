// ============ app/api/admin/auth/request-password-reset/route.ts ============
import { NextResponse } from "next/server";
import { adminRequestPasswordResetSchema } from "@/app/server/admin/AdminSchemaZod";
import { getAuthAdminService } from "@/app/server/authAdmin/authAdmin.container";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = adminRequestPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const authAdminService = getAuthAdminService();
    await authAdminService.requestPasswordReset(parsed.data.email);
    return NextResponse.json({ message: "Si un compte existe, un lien a été envoyé." });
  } catch (err) {
    console.error("admin request-password-reset error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}