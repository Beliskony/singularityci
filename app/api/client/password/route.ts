// ============ app/api/client/password/route.ts ============
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getClientService } from "@/app/server/client/client.container";
import { getClientIdOrNull, mapServiceError, unauthenticated } from "@/app/server/shared/apiAuth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const clientId = await getClientIdOrNull();
  if (!clientId) return unauthenticated();

  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(await req.json());
    await getClientService().changePassword(clientId, currentPassword, newPassword);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: error.flatten() }, { status: 400 });
    }
    return mapServiceError(error);
  }
}