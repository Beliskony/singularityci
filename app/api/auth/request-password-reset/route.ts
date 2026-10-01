// ============ app/api/auth/client/request-password-reset/route.ts ============
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthClientService } from "@/app/server/authClient/authClient.container";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const authClientService = getAuthClientService();
    await authClientService.requestPasswordReset(parsed.data.email);
    return NextResponse.json({ message: "Si un compte existe, un code a été envoyé." });
  } catch (err) {
    console.error("request-password-reset error:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}