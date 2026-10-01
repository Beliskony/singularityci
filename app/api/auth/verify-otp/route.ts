// ============ app/api/auth/client/verify-otp/route.ts ============
import { NextResponse } from "next/server";
import { verifyOtpSchema } from "@/app/server/client/ClientSchemaZod";
import { getAuthClientService } from "@/app/server/authClient/authClient.container";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const authClientService = getAuthClientService();
    await authClientService.verifyOtp(
      parsed.data.clientId,
      parsed.data.code,
      parsed.data.purpose
    );
    return NextResponse.json({ verified: true });
  } catch (err) {
    if (err instanceof Error && err.name === "OtpError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}