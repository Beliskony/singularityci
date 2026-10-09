// ============ app/api/payments/initiate/route.ts ============
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getPaymentService } from "@/app/server/payments/payment.container";
import { initiatePaymentSchema } from "@/app/server/payments/PaymentSchemaZod";
import { NotFoundError, OwnershipError, BusinessRuleError } from "@/app/server/payments/Payment.service";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  // phone est séparé du schéma d'input métier : il ne concerne que le provider
  // (numéro à débiter en mobile money), pas une donnée du paiement lui-même.
  const { phone, ...rest } = (body as Record<string, unknown>) ?? {};
  const parsed = initiatePaymentSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const paymentService = getPaymentService();
    const result = await paymentService.initiatePayment(
      payload.clientId,
      typeof phone === "string" ? phone : "",
      parsed.data
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err }, { status: 404 });
    }
    if (err instanceof OwnershipError) {
      return NextResponse.json({ error: err }, { status: 403 });
    }
    if (err instanceof BusinessRuleError) {
      return NextResponse.json({ error: err }, { status: 409 });
    }
    console.error("[POST /api/payments/initiate]", err);
    return NextResponse.json({ error: "PAYMENT_INITIATION_FAILED" }, { status: 500 });
  }
}