// ============ app/frontend/components/dashboard/AccountForms.tsx ============
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Feedback = { type: "success" | "error"; message: string } | null;

const ERRORS: Record<string, string> = {
  PHONE_ALREADY_USED: "Ce numéro est déjà utilisé par un autre compte.",
  CURRENT_PASSWORD_INVALID: "Le mot de passe actuel est incorrect.",
  NEW_PASSWORD_MUST_DIFFER: "Le nouveau mot de passe doit être différent de l'ancien.",
  CANNOT_DELETE_ACCOUNT_WITH_ACTIVE_SITES:
    "Impossible de supprimer le compte tant qu'un site est actif ou en attente de paiement.",
  VALIDATION_ERROR: "Certaines informations sont invalides.",
  UNAUTHENTICATED: "Session expirée, reconnectez-vous.",
};

function FeedbackBox({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p
      className={`rounded-xl px-4 py-3 text-sm ${
        feedback.type === "success"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      }`}
    >
      {feedback.message}
    </p>
  );
}

const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";
const primaryBtn =
  "px-6 py-2.5 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50";

export function AccountForms({ initial }: { initial: { fullName: string; phone: string } }) {
  return (
    <div className="mt-10 space-y-12">
      <ProfileForm initial={initial} />
      <PasswordForm />
      <DangerZone />
    </div>
  );
}

function ProfileForm({ initial }: { initial: { fullName: string; phone: string } }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: "error", message: ERRORS[data.error] ?? "Une erreur est survenue, réessayez." });
        return;
      }
      setFeedback({ type: "success", message: "Profil mis à jour." });
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: "Impossible de contacter le serveur." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="font-display italic text-xl text-foreground">Informations personnelles</h2>
      <FeedbackBox feedback={feedback} />
      <label className="block">
        <span className="text-sm text-foreground/60">Nom complet</span>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} minLength={2} maxLength={100} required className={inputCls} />
      </label>
      <label className="block">
        <span className="text-sm text-foreground/60">Téléphone</span>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 07 00 00 00 00" className={inputCls} />
      </label>
      <button type="submit" disabled={saving} className={primaryBtn}>
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (newPassword.length < 8) return setFeedback({ type: "error", message: "8 caractères minimum." });
    if (newPassword !== confirm) return setFeedback({ type: "error", message: "Les deux mots de passe ne correspondent pas." });

    setSaving(true);
    try {
      const res = await fetch("/api/client/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: "error", message: ERRORS[data.error] ?? "Une erreur est survenue, réessayez." });
        return;
      }
      setCurrent("");
      setNew("");
      setConfirm("");
      setFeedback({ type: "success", message: "Mot de passe modifié." });
    } catch {
      setFeedback({ type: "error", message: "Impossible de contacter le serveur." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="font-display italic text-xl text-foreground">Mot de passe</h2>
      <FeedbackBox feedback={feedback} />
      <label className="block">
        <span className="text-sm text-foreground/60">Mot de passe actuel</span>
        <input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} required className={inputCls} />
      </label>
      <label className="block">
        <span className="text-sm text-foreground/60">Nouveau mot de passe</span>
        <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNew(e.target.value)} required className={inputCls} />
      </label>
      <label className="block">
        <span className="text-sm text-foreground/60">Confirmer le nouveau mot de passe</span>
        <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={inputCls} />
      </label>
      <button type="submit" disabled={saving} className={primaryBtn}>
        {saving ? "Modification…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}

function DangerZone() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function remove() {
    setDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/client/account", { method: "DELETE", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: "error", message: ERRORS[data.error] ?? "Une erreur est survenue, réessayez." });
        setOpen(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: "Impossible de contacter le serveur." });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-red-300/60 p-6 space-y-4">
      <h2 className="font-display italic text-xl text-foreground">Supprimer mon compte</h2>
      <p className="text-sm text-foreground/60">
        Cette action est définitive. Elle n&apos;est possible que si aucun de vos sites n&apos;est actif ou en attente de paiement.
      </p>
      <FeedbackBox feedback={feedback} />
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="px-5 py-2.5 rounded-full border border-red-400 text-red-600 text-sm hover:bg-red-50 dark:hover:bg-red-950/30">
          Supprimer mon compte
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-foreground">Confirmer la suppression ?</span>
          <button type="button" onClick={remove} disabled={deleting} className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm disabled:opacity-50">
            {deleting ? "Suppression…" : "Oui, supprimer"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-full border border-border text-sm text-foreground">
            Annuler
          </button>
        </div>
      )}
    </section>
  );
}