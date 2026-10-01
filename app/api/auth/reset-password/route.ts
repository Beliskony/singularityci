// ============ app/api/auth/client/reset-password/route.ts ============
import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/app/server/client/ClientSchemaZod";
import { getAuthClientService } from "@/app/server/authClient/authClient.container";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const authClientService = getAuthClientService();
    await authClientService.resetPassword(
      parsed.data.clientId,
      parsed.data.otpCode,
      parsed.data.newPassword
    );
    return NextResponse.json({ message: "Mot de passe réinitialisé." });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "OtpError":
          return NextResponse.json({ error: err.message }, { status: 400 });
        case "BusinessRuleError":
          return NextResponse.json({ error: err.message }, { status: 400 });
        default:
          break;
      }
    }
    console.error("reset-password error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}