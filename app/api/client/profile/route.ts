// ============ app/api/client/profile/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { updateClientProfileSchema } from "@/app/server/client/ClientSchemaZod";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";

const JWT_SECRET = process.env.JWT_SECRET!;

async function requireClient(): Promise<IClientAuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await requireClient();
  if (!session) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  try {
    const clientService = getClientService();
    const client = await clientService.getProfile(session.clientId);
    const { passwordHash, ...safeClient } = client;
    return NextResponse.json({ client: safeClient });
  } catch (err) {
    if (err instanceof Error && err.name === "NotFoundError") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error("get profile error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireClient();
  if (!session) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = updateClientProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const clientService = getClientService();
    const client = await clientService.updateProfile(session.clientId, parsed.data);
    const { passwordHash, ...safeClient } = client;
    return NextResponse.json({ client: safeClient });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "NotFoundError":
          return NextResponse.json({ error: err.message }, { status: 404 });
        case "BusinessRuleError":
          return NextResponse.json({ error: err.message }, { status: 400 });
        default:
          break;
      }
    }
    console.error("update profile error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}