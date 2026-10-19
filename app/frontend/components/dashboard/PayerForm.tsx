// ============ app/frontend/components/dashboard/PayerForm.tsx ============
"use client";

import { useState } from "react";

type Method = "MOBILE_MONEY" | "CARD";

const ERRORS: Record<string, string> = {
  PAYMENT_ALREADY_IN_PROGRESS: "Un paiement est déjà en cours pour ce site. Patientez ou vérifiez votre téléphone.",
  SITE_NOT_PAYABLE_IN_CURRENT_STATUS: "Ce site n'est plus en attente de paiement.",
  TEMPLATE_NOT_AVAILABLE: "Ce modèle n'est plus disponible à l'achat.",
  "NOT_FOUND: SITE": "Site introuvable.",
};

export function PayerForm({ siteId }: { siteId: string }) {
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
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(ERRORS[data.error] ?? "Impossible de lancer le paiement. Réessayez.");
        return;
      }
      if (data.redirectUrl) {
        // Navigation complète vers la page de paiement hébergée par FedaPay.
        window.location.href = data.redirectUrl;
        return; // on garde le bouton bloqué pendant la redirection
      }
      setError("Le fournisseur de paiement n'a pas renvoyé de lien de paiement.");
    } catch {
      setError("Impossible de contacter le serveur.");
    }
    setLoading(false);
  }

  const option = (m: Method, title: string, sub: string) => (
    <button
      type="button"
      onClick={() => setMethod(m)}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
        method === m ? "border-gold bg-gold/10" : "border-border hover:border-foreground/30"
      }`}
    >
      <span className="font-medium text-foreground">{title}</span>
      <p className="text-sm text-foreground/60">{sub}</p>
    </button>
  );

  return (
    <div>
      <div className="mt-8 space-y-3">
        {option("MOBILE_MONEY", "Mobile Money", "Orange Money, MTN Money, Moov Money…")}
        {option("CARD", "Carte bancaire", "Visa, Mastercard")}
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
  );
}