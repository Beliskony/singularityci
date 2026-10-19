// ============ app/frontend/components/purchase/PurchaseFlow.tsx ============
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PayerForm } from "@/app/frontend/components/dashboard/PayerForm";

interface Props {
  template: { id: string; slug: string; name: string };
  pendingSite: { id: string; groomName: string; brideName: string } | null;
}

type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

const ERRORS: Record<string, string> = {
  SUBDOMAIN_ALREADY_TAKEN: "Cette adresse est déjà prise, choisissez-en une autre.",
  TEMPLATE_NOT_AVAILABLE: "Ce modèle n'est plus disponible à l'achat.",
  VALIDATION_ERROR: "Vérifiez les informations saisies.",
};

// "Aïssata & Karim" → "aissata-karim"
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

export function PurchaseFlow({ template, pendingSite }: Props) {
  const router = useRouter();

  // Étape « paiement » directe si un brouillon existe déjà.
  const [siteId, setSiteId] = useState<string | null>(pendingSite?.id ?? null);
  const [creatingNew, setCreatingNew] = useState(false);

  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const subdomainTouched = useRef(false);

  const [availability, setAvailability] = useState<Availability>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggestion automatique de l'adresse tant que le client ne l'a pas modifiée lui-même.
  useEffect(() => {
    if (subdomainTouched.current) return;
    const suggestion = slugify([groomName, brideName].filter(Boolean).join("-"));
    setSubdomain(suggestion);
  }, [groomName, brideName]);

  // Vérification de disponibilité (debounce 400 ms).
  useEffect(() => {
    if (!subdomain) return setAvailability("idle");
    setAvailability("checking");
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/client/subdomain?value=${encodeURIComponent(subdomain)}`, { credentials: "include" });
        if (res.status === 401) return router.push(`/login?next=${encodeURIComponent(`/payments/checkout/${template.slug}`)}`);
        const data = await res.json();
        if (cancelled) return;
        setAvailability(!data.valid ? "invalid" : data.available ? "available" : "taken");
      } catch {
        if (!cancelled) setAvailability("idle");
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [subdomain, router, template.slug]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (availability === "taken") return setError(ERRORS.SUBDOMAIN_ALREADY_TAKEN);
    if (availability === "invalid") return setError("L'adresse doit contenir 3 à 40 caractères : lettres, chiffres et tirets.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/client/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          templateId: template.id,
          subdomain,
          groomName: groomName.trim(),
          brideName: brideName.trim(),
          eventDate,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) return router.push(`/login?next=${encodeURIComponent(`/payments/checkout/${template.slug}`)}`);
      if (!res.ok) {
        setError(ERRORS[data.error] ?? "Impossible de créer le site. Réessayez.");
        return;
      }
      setSiteId(data.site.id);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Étape 2 : paiement ----------
  if (siteId && !creatingNew) {
    return (
      <div className="mt-8">
        {pendingSite && siteId === pendingSite.id && (
          <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-foreground">
            Vous avez déjà un site en préparation :{" "}
            <strong>
              {pendingSite.groomName} &amp; {pendingSite.brideName}
            </strong>
            .{" "}
            <button
              type="button"
              onClick={() => {
                setCreatingNew(true);
                setSiteId(null);
              }}
              className="underline hover:text-gold"
            >
              En créer un nouveau
            </button>
          </div>
        )}
        <h2 className="mt-8 font-display italic text-2xl text-foreground">Paiement</h2>
        <p className="mt-1 text-foreground/60">
          Après le paiement, vous serez redirigé vers votre espace pour personnaliser et partager votre site.
        </p>
        <div className="max-w-md">
          <PayerForm siteId={siteId} />
        </div>
      </div>
    );
  }

  // ---------- Étape 1 : informations ----------
  const hint: Record<Availability, { text: string; cls: string } | null> = {
    idle: null,
    checking: { text: "Vérification…", cls: "text-foreground/50" },
    available: { text: "✓ Adresse disponible", cls: "text-green-700 dark:text-green-400" },
    taken: { text: "✕ Adresse déjà prise", cls: "text-red-600" },
    invalid: { text: "3 à 40 caractères : lettres, chiffres et tirets", cls: "text-red-600" },
  };
  const h = hint[availability];

  return (
    <form onSubmit={handleCreate} className="mt-8 space-y-5 max-w-xl">
      <h2 className="font-display italic text-2xl text-foreground">Les informations de votre mariage</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-foreground/60">Prénom du marié</span>
          <input value={groomName} onChange={(e) => setGroomName(e.target.value)} required maxLength={60} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm text-foreground/60">Prénom de la mariée</span>
          <input value={brideName} onChange={(e) => setBrideName(e.target.value)} required maxLength={60} className={inputCls} />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-foreground/60">Date du mariage</span>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          required
          className={inputCls}
        />
        <span className="mt-1 block text-xs text-foreground/50">
          Votre site reste en ligne jusqu&apos;à cette date. Elle ne pourra plus être changée après le paiement.
        </span>
      </label>

      <label className="block">
        <span className="text-sm text-foreground/60">Adresse de votre site</span>
        <div className="mt-1 flex items-stretch rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-gold/40 overflow-hidden">
          <input
            value={subdomain}
            onChange={(e) => {
              subdomainTouched.current = true;
              setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
            }}
            required
            maxLength={40}
            placeholder="junior-cynthia"
            className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-foreground outline-none"
          />
          <span className="px-3 flex items-center text-sm text-foreground/50 bg-foreground/5">.singularity.ci</span>
        </div>
        {h && <span className={`mt-1 block text-xs ${h.cls}`}>{h.text}</span>}
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || availability === "checking" || availability === "taken"}
        className="px-8 py-3 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50"
      >
        {submitting ? "Création…" : "Continuer vers le paiement"}
      </button>
    </form>
  );
}