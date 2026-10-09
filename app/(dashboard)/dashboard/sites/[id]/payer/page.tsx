// ============ app/(dashboard)/dashboard/sites/[id]/payer/page.tsx ============
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

type Method = "MOBILE_MONEY" | "CARD";

export default function PayerSitePage() {
  const params = useParams<{ id: string }>();
  const siteId = params.id;

  const [method, setMethod] = useState<Method>("MOBILE_MONEY");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);

    if (method === "MOBILE_MONEY" && !phone.trim()) {
      setError("Entrez le numéro à débiter pour le paiement mobile money.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ siteId, method, phone: method === "MOBILE_MONEY" ? phone : undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        switch (data.error) {
          case "PAYMENT_ALREADY_IN_PROGRESS":
            setError("Un paiement est déjà en cours pour ce site. Patientez ou vérifiez votre téléphone.");
            break;
          case "SITE_NOT_PAYABLE_IN_CURRENT_STATUS":
            setError("Ce site n'est plus en attente de paiement.");
            break;
          case "TEMPLATE_NOT_AVAILABLE":
            setError("Ce modèle n'est plus disponible à l'achat.");
            break;
          case "NOT_FOUND: SITE":
            setError("Site introuvable.");
            break;
          default:
            setError("Impossible de lancer le paiement. Réessayez.");
        }
        return;
      }

      if (data.redirectUrl) {
        // Navigation complète : on quitte l'app pour la page de paiement hébergée par FedaPay.
        window.location.href = data.redirectUrl;
      } else {
        setError("Le fournisseur de paiement n'a pas renvoyé de lien de paiement.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-16 bg-background">
      <div className="w-full max-w-md">
        <h1 className="font-display italic text-3xl text-foreground">Finaliser votre site</h1>
        <p className="mt-2 text-foreground/60">
          Choisissez votre mode de paiement. Le montant exact s'affichera sur la page de paiement sécurisée.
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => setMethod("MOBILE_MONEY")}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
              method === "MOBILE_MONEY" ? "border-gold bg-gold/10" : "border-border hover:border-foreground/30"
            }`}
          >
            <span className="font-medium text-foreground">Mobile Money</span>
            <p className="text-sm text-foreground/60">Orange Money, MTN Money, Moov Money…</p>
          </button>

          <button
            type="button"
            onClick={() => setMethod("CARD")}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
              method === "CARD" ? "border-gold bg-gold/10" : "border-border hover:border-foreground/30"
            }`}
          >
            <span className="font-medium text-foreground">Carte bancaire</span>
            <p className="text-sm text-foreground/60">Visa, Mastercard</p>
          </button>
        </div>

        {method === "MOBILE_MONEY" && (
          <div className="mt-4">
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
              Numéro à débiter
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225 07 00 00 00 00"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="mt-6 w-full px-4 py-3 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? "Redirection..." : "Procéder au paiement"}
        </button>
      </div>
    </div>
  );
}