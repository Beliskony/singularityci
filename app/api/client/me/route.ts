// ============ app/api/client/me/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { ClientRepositoryImpl } from "@/app/server/client/Client.repository";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;

  if (!token) {
    return NextResponse.json({ client: null }, { status: 200 });
  }

  let payload: IClientAuthPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    // Token invalide/expiré : on nettoie le cookie côté réponse plutôt que de laisser
    // le front retenter indéfiniment avec un cookie mort.
    const res = NextResponse.json({ client: null }, { status: 200 });
    res.cookies.delete("client_session");
    return res;
  }

  const clientRepo = new ClientRepositoryImpl();
  const client = await clientRepo.findById(payload.clientId);

  if (!client) {
    const res = NextResponse.json({ client: null }, { status: 200 });
    res.cookies.delete("client_session");
    return res;
  }

  // On ne renvoie jamais passwordHash/googleId au front : juste ce dont la navbar/dashboard ont besoin.
  return NextResponse.json({
    client: {
      id: client.id,
      fullName: client.fullName,
      email: client.email,
    },
  });
}