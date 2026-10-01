// ============ app/api/admin/payments/[paymentId]/refund/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { IAdminAuthPayload } from "@/app/server/admin/IAdmin";
import { getAdminService } from "@/app/server/admin/admin.container";

const JWT_SECRET = process.env.JWT_SECRET!;
const bodySchema = z.object({ reason: z.string().min(5).max(300) });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  let session: IAdminAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IAdminAuthPayload;
  } catch {
    return NextResponse.json({ error: "INVALID_SESSION" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const adminService = getAdminService();
    await adminService.refundPayment(session, paymentId, parsed.data.reason);
    return NextResponse.json({ message: "Paiement remboursé." });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "ForbiddenError":
          return NextResponse.json({ error: err.message }, { status: 403 });
        case "BusinessRuleError":
          return NextResponse.json({ error: err.message }, { status: 400 });
        default:
          break;
      }
    }
    console.error("refund payment error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}