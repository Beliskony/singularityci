// ============ app/api/webhooks/payments/fedapay/route.ts ============
import { NextResponse } from "next/server";
import { Webhook, Transaction } from "fedapay";
import { getPaymentService } from "@/app/server/payments/payment.container";

const WEBHOOK_SECRET = process.env.FEDAPAY_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-fedapay-signature");

  if (!signature) {
    return NextResponse.json({ error: "MISSING_SIGNATURE" }, { status: 401 });
  }

  let event: any;
  try {
    // Le SDK officiel vérifie la signature ET parse le JSON — on ne fait jamais
    // JSON.parse nous-mêmes sur un body dont la signature n'a pas encore été validée
    event = Webhook.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("FedaPay webhook signature invalide:", err);
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  // On ne traite que les événements liés au cycle de vie d'une transaction
  if (!["transaction.approved", "transaction.declined", "transaction.canceled"].includes(event.name)) {
    return NextResponse.json({ received: true }); // événement ignoré, mais 200 pour éviter les retries FedaPay
  }

  const transactionId = event.entity?.id ?? event.entity_id;
  if (!transactionId) {
    console.error("FedaPay webhook sans id de transaction:", event);
    return NextResponse.json({ error: "MALFORMED_EVENT" }, { status: 400 });
  }

  // Par sécurité, on ne fait jamais confiance au montant/statut du corps du webhook —
  // on re-interroge l'API FedaPay pour avoir la donnée de référence
  let transaction: any;
  try {
    transaction = await Transaction.retrieve(transactionId);
  } catch (err) {
    console.error("Impossible de récupérer la transaction FedaPay:", err);
    return NextResponse.json({ error: "TRANSACTION_FETCH_FAILED" }, { status: 502 });
  }

  const outcome: "SUCCESS" | "FAILED" = event.name === "transaction.approved" ? "SUCCESS" : "FAILED";

  try {
    const paymentService = getPaymentService();
    await paymentService.handleProviderWebhook(
      String(transaction.id),
      outcome,
      Number(transaction.amount)
    );
    return NextResponse.json({ received: true });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "NotFoundError":
          return NextResponse.json({ error: err.message }, { status: 404 });
        case "BusinessRuleError":
          console.error("WEBHOOK SUSPECT:", err.message, { transactionId });
          return NextResponse.json({ error: err.message }, { status: 400 });
        default:
          break;
      }
    }
    console.error("fedapay webhook error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}