// ============ app/api/client/account/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    return NextResponse.json({ error: "INVALID_SESSION" }, { status: 401 });
  }

  try {
    const clientService = getClientService();
    await clientService.requestAccountDeletion(session.clientId);

    // Le compte est supprimé (soft delete) : on invalide la session côté navigateur
    cookieStore.delete("client_session");

    return NextResponse.json({ message: "Compte supprimé." });
  } catch (err) {
    if (err instanceof Error && err.name === "BusinessRuleError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("delete account error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}