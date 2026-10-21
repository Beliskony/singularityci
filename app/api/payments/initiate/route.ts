// ============ app/api/payments/initiate/route.ts ============
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getPaymentService } from "@/app/server/payments/payment.container";
import { initiatePaymentSchema } from "@/app/server/payments/PaymentSchemaZod";
import { MOBILE_MONEY_OPERATORS, type MobileMoneyOperator } from "@/app/server/payments/Payment.service";

const JWT_SECRET = process.env.JWT_SECRET!;

// Les erreurs sont reconnues par leur `name` et non par `instanceof` : Payment.service,
// Site.service et Client.service déclarent chacun leurs propres NotFoundError / OwnershipError /
// BusinessRuleError. En mode sandbox, settle() appelle siteService.activateAfterPayment() ; une
// erreur métier levée par Site.service n'était pas reconnue par un `instanceof` sur les classes
// de Payment.service et se transformait en 500 « PAYMENT_INITIATION_FAILED ».
function mapError(err: unknown): NextResponse {
  if (err instanceof Error) {
    if (err.name === "NotFoundError") return NextResponse.json({ error: err.message }, { status: 404 });
    if (err.name === "OwnershipError") return NextResponse.json({ error: err.message }, { status: 403 });
    if (err.name === "BusinessRuleError") return NextResponse.json({ error: err.message }, { status: 409 });
  }
  console.error("[POST /api/payments/initiate]", err);
  return NextResponse.json({ error: "PAYMENT_INITIATION_FAILED" }, { status: 500 });
}

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
  const { phone, operator, ...rest } = (body as Record<string, unknown>) ?? {};
  const parsed = initiatePaymentSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 });
  }

  // operator : comme phone, ne concerne que le provider ; valeur inconnue ignorée (page FedaPay au choix).
  const op = MOBILE_MONEY_OPERATORS.find((o) => o === operator) as MobileMoneyOperator | undefined;

  try {
    const result = await getPaymentService().initiatePayment(
      payload.clientId,
      typeof phone === "string" ? phone.trim() : "",
      parsed.data,
      op
    );
    return NextResponse.json(result);
  } catch (err) {
    return mapError(err);
  }
}