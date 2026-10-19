// ============ app/api/client/account/route.ts ============
// Suppression du compte (soft delete). Refusée si un site est ACTIVE ou
// PENDING_PAYMENT (409 CANNOT_DELETE_ACCOUNT_WITH_ACTIVE_SITES).
import { NextResponse } from "next/server";
import { getClientService } from "@/app/server/client/client.container";
import { getClientIdOrNull, mapServiceError, unauthenticated } from "@/app/server/shared/apiAuth";

export async function DELETE() {
  const clientId = await getClientIdOrNull();
  if (!clientId) return unauthenticated();

  try {
    await getClientService().requestAccountDeletion(clientId);
    const res = NextResponse.json({ success: true });
    // Même attributs qu'à la création du cookie (cf. /api/client/logout).
    res.cookies.set("client_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (error) {
    return mapServiceError(error);
  }
}