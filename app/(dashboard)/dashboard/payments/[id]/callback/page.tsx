// ============ app/(dashboard)/dashboard/payments/[id]/callback/page.tsx ============
// Page de retour FedaPay : interroge /api/payments/[id] jusqu'à ce que le
// webhook ait confirmé le paiement.
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Status = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
type View = Status | "CHECKING" | "TIMEOUT" | "ERROR" | "NOT_FOUND";

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 20; // ~50 s : le webhook peut arriver après le retour du client

export default function PaymentCallbackPage() {
  const params = useParams<{ id: string }>();
  const paymentId = params.id;

  const [view, setView] = useState<View>("CHECKING");
  const [siteId, setSiteId] = useState<string | null>(null);
  const [round, setRound] = useState(0); // incrémenté par « Vérifier à nouveau » pour relancer le polling

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    setView("CHECKING");

    async function poll() {
      try {
        const res = await fetch(`/api/payments/${paymentId}`, { credentials: "include", cache: "no-store" });
        if (cancelled) return;

        if (res.status === 404 || res.status === 403) return setView("NOT_FOUND");
        if (!res.ok) return setView("ERROR");

        const data = await res.json();
        if (cancelled) return;
        setSiteId(data.siteId ?? null);

        if (data.status === "SUCCESS" || data.status === "FAILED" || data.status === "REFUNDED") {
          return setView(data.status);
        }

        // Toujours PENDING : le webhook n'est peut-être pas encore arrivé.
        attempts += 1;
        if (attempts >= MAX_ATTEMPTS) return setView("TIMEOUT");
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setView("ERROR");
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer); // pas de requête orpheline après navigation
    };
  }, [paymentId, round]);

  const hubHref = siteId ? `/dashboard/sites/${siteId}` : "/dashboard";

  // Paiement confirmé : on renvoie automatiquement vers le dashboard.
  // location.assign (navigation complète) pour recharger la liste des sites depuis le serveur.
  useEffect(() => {
    if (view !== "SUCCESS") return;
    const t = setTimeout(() => window.location.assign("/dashboard"), 2500);
    return () => clearTimeout(t);
  }, [view]);

  const primary =
    "mt-6 inline-block px-6 py-3 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors";
  const secondary =
    "px-5 py-2.5 rounded-full border border-border text-foreground hover:border-foreground/40 transition-colors";

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-16 bg-background text-center">
      <div className="w-full max-w-md">
        {view === "CHECKING" && (
          <>
            <div className="mx-auto w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <h1 className="mt-6 font-display italic text-2xl text-foreground">Vérification du paiement...</h1>
            <p className="mt-2 text-foreground/60">Ne fermez pas cette page, cela ne prend que quelques secondes.</p>
          </>
        )}

        {view === "SUCCESS" && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">✓</div>
            <h1 className="mt-6 font-display italic text-2xl text-foreground">Paiement confirmé</h1>
            <p className="mt-2 text-foreground/60">
              Votre site de mariage est maintenant en ligne. Redirection vers votre espace…
            </p>
            <a href="/dashboard" className={primary}>
              Accéder à mon espace
            </a>
          </>
        )}

        {view === "FAILED" && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl">✕</div>
            <h1 className="mt-6 font-display italic text-2xl text-foreground">Paiement échoué</h1>
            <p className="mt-2 text-foreground/60">La transaction n&apos;a pas abouti. Vous pouvez réessayer.</p>
            <Link href={siteId ? `/dashboard/sites/${siteId}/payer` : "/dashboard"} className={primary}>
              Réessayer
            </Link>
          </>
        )}

        {view === "REFUNDED" && (
          <>
            <h1 className="font-display italic text-2xl text-foreground">Paiement remboursé</h1>
            <p className="mt-2 text-foreground/60">Ce paiement a été remboursé.</p>
            <Link href={hubHref} className={primary}>
              Retour à mon site
            </Link>
          </>
        )}

        {view === "NOT_FOUND" && (
          <>
            <h1 className="font-display italic text-2xl text-foreground">Paiement introuvable</h1>
            <p className="mt-2 text-foreground/60">Ce paiement n&apos;existe pas ou n&apos;est pas associé à votre compte.</p>
            <Link href="/dashboard" className={primary}>
              Retour au dashboard
            </Link>
          </>
        )}

        {(view === "TIMEOUT" || view === "ERROR") && (
          <>
            <h1 className="font-display italic text-2xl text-foreground">
              {view === "TIMEOUT" ? "Ça prend plus de temps que prévu" : "Une erreur est survenue"}
            </h1>
            <p className="mt-2 text-foreground/60">
              {view === "TIMEOUT"
                ? "Votre paiement est peut-être déjà validé : la confirmation peut mettre quelques minutes à arriver. Vous n'avez pas besoin de payer de nouveau."
                : "Impossible de vérifier le statut du paiement pour le moment."}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button type="button" onClick={() => setRound((r) => r + 1)} className={secondary}>
                Vérifier à nouveau
              </button>
              <Link href={hubHref} className="px-5 py-2.5 rounded-full bg-foreground text-background font-medium">
                Retour à mon site
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}