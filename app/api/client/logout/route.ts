// ============ app/api/client/logout/route.ts ============
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  // maxAge: 0 supprime immédiatement le cookie côté navigateur.
  // Mêmes attributs (path, httpOnly, sameSite) qu'à la création, sinon certains
  // navigateurs ignorent la suppression.
  res.cookies.set("client_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}