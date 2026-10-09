// ============ app/api/auth/client/google/route.ts ============
import { NextRequest, NextResponse } from "next/server";
import { getAuthClientService } from "@/app/server/authClient/authClient.container";
import { BusinessRuleError } from "@/app/server/authClient/authClient.service";

const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // doit rester cohérent avec CLIENT_TOKEN_TTL ("7d") du service

export async function POST(req: NextRequest) {
  let body: { idToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  if (!body.idToken) {
    return NextResponse.json({ error: "MISSING_ID_TOKEN" }, { status: 400 });
  }

  try {
    const authService = getAuthClientService();
    const { token, client, isNewAccount } = await authService.loginOrRegisterWithGoogle(body.idToken);

    const res = NextResponse.json({
      isNewAccount,
      client: { id: client.id, fullName: client.fullName, email: client.email },
    });

    res.cookies.set("client_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
    });

    return res;
  } catch (err) {
    if (err instanceof BusinessRuleError) {
      // ex: GOOGLE_EMAIL_NOT_VERIFIED
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error("[POST /api/auth/client/google]", err);
    return NextResponse.json({ error: "GOOGLE_AUTH_FAILED" }, { status: 401 });
  }
}