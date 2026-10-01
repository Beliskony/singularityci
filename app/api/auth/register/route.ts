// ============ app/api/auth/client/register/route.ts ============
import { NextResponse } from "next/server";
import { registerClientSchema } from "@/app/server/client/ClientSchemaZod";
import { getAuthClientService } from "@/app/server/authClient/authClient.container";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = registerClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const authClientService = getAuthClientService();
    const result = await authClientService.register(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "BusinessRuleError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof Error) {
      switch (err.name) {
        case "BusinessRuleError":
          return NextResponse.json({ error: err.message }, { status: 400 });
        default:
          break;
      }
    }
    console.error("register error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}