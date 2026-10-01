// ============ app/api/auth/client/login/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginClientSchema } from "@/app/server/client/ClientSchemaZod";
import { getAuthClientService } from "@/app/server/authClient/authClient.container";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = loginClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const authClientService = getAuthClientService();
    const { token, client } = await authClientService.login(parsed.data);

    const cookieStore = await cookies(); // async depuis Next 15
    cookieStore.set("client_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    const { passwordHash, ...safeClient } = client;
    return NextResponse.json({ client: safeClient });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "InvalidCredentialsError":
          return NextResponse.json({ error: err.message }, { status: 401 });
        case "AccountLockedError":
          return NextResponse.json({ error: err.message }, { status: 423 });
        default:
          break;
      }
    }
    console.error("login error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}