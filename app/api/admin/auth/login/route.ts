// ============ app/api/admin/auth/login/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminLoginSchema } from "@/app/server/admin/AdminSchemaZod";
import { getAuthAdminService } from "@/app/server/authAdmin/authAdmin.container";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const authAdminService = getAuthAdminService();
    const { token, admin } = await authAdminService.login(parsed.data);

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12, // 12h, cohérent avec le TTL du JWT admin
      path: "/",
    });

    const { passwordHash, ...safeAdmin } = admin;
    return NextResponse.json({ admin: safeAdmin });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "InvalidCredentialsError":
          return NextResponse.json({ error: err.message }, { status: 401 });
        case "AccountLockedError":
          return NextResponse.json({ error: err.message }, { status: 423 });
        case "AccountInactiveError":
          return NextResponse.json({ error: err.message }, { status: 403 });
        default:
          break;
      }
    }
    console.error("admin login error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}