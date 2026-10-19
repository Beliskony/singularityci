// ============ app/api/client/profile/route.ts ============
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getClientService } from "@/app/server/client/client.container";
import { getClientIdOrNull, mapServiceError, unauthenticated } from "@/app/server/shared/apiAuth";

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(8).max(20).optional(),
});

export async function PATCH(req: NextRequest) {
  const clientId = await getClientIdOrNull();
  if (!clientId) return unauthenticated();

  try {
    const data = updateProfileSchema.parse(await req.json());
    const client = await getClientService().updateProfile(clientId, data);
    return NextResponse.json({ client: { id: client.id, fullName: client.fullName, phone: client.phone } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: error.flatten() }, { status: 400 });
    }
    return mapServiceError(error);
  }
}