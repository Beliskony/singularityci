// ============ app/server/shared/apiAuth.ts ============
// Helpers communs aux routes /api/client/* : lecture du cookie de session
// et conversion des erreurs métier en réponses HTTP.
//
// Client.service.ts et Site.service.ts déclarent chacun leurs propres classes
// NotFoundError / OwnershipError / BusinessRuleError : un `instanceof` sur l'une
// ne reconnaît pas l'autre. On s'appuie donc sur `error.name`, identique partout.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getClientIdOrNull(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) return null;
  try {
    return (jwt.verify(token, JWT_SECRET) as IClientAuthPayload).clientId;
  } catch {
    return null;
  }
}

export function unauthenticated(): NextResponse {
  return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
}

export function mapServiceError(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (error.name === "NotFoundError") return NextResponse.json({ error: error.message }, { status: 404 });
    if (error.name === "OwnershipError") return NextResponse.json({ error: error.message }, { status: 403 });
    if (error.name === "BusinessRuleError") return NextResponse.json({ error: error.message }, { status: 409 });
  }
  console.error(error);
  return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
}