// ============ app/(dashboard)/dashboard/payments/[id]/callback/page.tsx ============
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Status = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 12; // ~30s avant d'abandonner le polling et d'inviter à rafraîchir

export default function PaymentCallbackPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const paymentId = params.id;

  const [status, setStatus] = useState<Status | "CHECKING" | "TIMEOUT" | "ERROR">("CHECKING");
  const [siteId, setSiteId] = useState<string | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/payments/${paymentId}`, { credentials: "include" });
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setStatus("ERROR");
          return;
        }

        setSiteId(data.siteId ?? null);

        if (data.status === "SUCCESS" || data.status === "FAILED" || data.status === "REFUNDED") {
          setStatus(data.status);
          return;
        }

        // Toujours PENDING : le webhook FedaPay n'est peut-être pas encore arrivé.
        attemptsRef.current += 1;
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setStatus("TIMEOUT");
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setStatus("ERROR");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-16 bg-background text-center">
      <div className="w-full max-w-md">
        {status === "CHECKING" && (
          <>
            <div className="mx-auto w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <h1 className="mt-6 font-display italic text-2xl text-foreground">Vérification du paiement...</h1>
            <p className="mt-2 text-foreground/60">Ne fermez pas cette page, ça ne prend que quelques secondes.</p>
          </>
        )}

        {status === "SUCCESS" && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
              ✓
            </div>
            <h1 className="mt-6 font-display italic text-2xl text-foreground">Paiement confirmé</h1>
            <p className="mt-2 text-foreground/60">Votre site de mariage est maintenant actif.</p>
            <button
              onClick={() => router.push(siteId ? `/dashboard/sites/${siteId}` : "/dashboard")}
              className="mt-6 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors"
            >
              Voir mon site
            </button>
          </>
        )}

        {status === "FAILED" && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl">
              ✕
            </div>
            <h1 className="mt-6 font-display italic text-2xl text-foreground">Paiement échoué</h1>
            <p className="mt-2 text-foreground/60">La transaction n'a pas abouti. Vous pouvez réessayer.</p>
            <button
              onClick={() => router.push(siteId ? `/dashboard/sites/${siteId}/payer` : "/dashboard")}
              className="mt-6 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors"
            >
              Réessayer
            </button>
          </>
        )}

        {status === "REFUNDED" && (
          <>
            <h1 className="mt-6 font-display italic text-2xl text-foreground">Paiement remboursé</h1>
            <p className="mt-2 text-foreground/60">Ce paiement a été remboursé.</p>
          </>
        )}

        {(status === "TIMEOUT" || status === "ERROR") && (
          <>
            <h1 className="font-display italic text-2xl text-foreground">
              {status === "TIMEOUT" ? "Ça prend plus de temps que prévu" : "Une erreur est survenue"}
            </h1>
            <p className="mt-2 text-foreground/60">
              {status === "TIMEOUT"
                ? "Votre paiement est peut-être déjà validé côté provider. Rafraîchissez dans un instant."
                : "Impossible de vérifier le statut du paiement pour le moment."}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-full border border-border text-foreground hover:border-foreground/40 transition-colors"
              >
                Rafraîchir
              </button>
              <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-foreground text-background font-medium">
                Retour au dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}