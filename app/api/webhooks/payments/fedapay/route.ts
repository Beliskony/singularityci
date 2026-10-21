// ============ app/api/webhooks/payments/fedapay/route.ts ============
// Reçoit les notifications FedaPay (dashboard → Workbench → Webhooks).
// URL à déclarer : https://<votre-domaine>/api/webhooks/payments/fedapay
// Cette route doit être publique (pas de cookie de session, exclue d'un éventuel middleware).
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "fedapay";
import { getPaymentService } from "@/app/server/payments/payment.container";

// Le corps brut est indispensable à la vérification de signature : ne jamais passer par req.json().
export async function POST(req: NextRequest) {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] FEDAPAY_WEBHOOK_SECRET manquante");
    return NextResponse.json({ error: "WEBHOOK_NOT_CONFIGURED" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-fedapay-signature") ?? "";

  let event: any;
  try {
    event = Webhook.constructEvent(rawBody, signature, secret);
  } catch (err) {
    // Signature invalide ou corps altéré : 400, FedaPay ne doit pas réessayer indéfiniment.
    console.warn("[webhook] signature invalide", (err as Error).message);
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 });
  }

  // La structure de `entity` n'est pas documentée : on lit l'id de la transaction aux deux
  // endroits plausibles, puis on relit tout (statut, montant) auprès de FedaPay.
  const name: string = String(event?.name ?? event?.type ?? "");
  if (!name.startsWith("transaction.")) {
    return NextResponse.json({ received: true, ignored: name });
  }
  const transactionId = event?.entity?.id ?? event?.object_id;
  if (!transactionId) {
    console.warn("[webhook] id de transaction introuvable dans l'événement", name);
    return NextResponse.json({ received: true, ignored: "NO_TRANSACTION_ID" });
  }

  try {
    await getPaymentService().syncByProviderRef(String(transactionId));
  } catch (err) {
    if (err instanceof Error && err.name === "NotFoundError") {
      // Transaction inconnue de notre base (autre application sur le même compte, test manuel…) :
      // on répond 2xx, sinon FedaPay réessaie 9 fois puis désactive le webhook.
      return NextResponse.json({ received: true, ignored: "UNKNOWN_TRANSACTION" });
    }
    console.error("[webhook] erreur de traitement", err);
    return NextResponse.json({ error: "PROCESSING_FAILED" }, { status: 500 }); // FedaPay réessaiera
  }

  return NextResponse.json({ received: true });
}