// ============ app/api/payments/[id]/route.ts ============
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getPaymentService } from "@/app/server/payments/payment.container";
import { NotFoundError, OwnershipError } from "@/app/server/payments/Payment.service";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  let payload: IClientAuthPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  try {
    const paymentService = getPaymentService();
    const status = await paymentService.getStatus(payload.clientId, id);
    return NextResponse.json(status);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof OwnershipError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[GET /api/payments/[id]]", err);
    return NextResponse.json({ error: "STATUS_CHECK_FAILED" }, { status: 500 });
  }
}