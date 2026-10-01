// ============ app/(auth)/register/page.tsx ============
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { AuthLayout } from "@/app/frontend/components/principal/auth/AuthLayout";
import { GoogleButton } from "@/app/frontend/components/principal/auth/GoogleButton";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

function getRecaptchaToken(action: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error("reCAPTCHA non chargé"));
      return;
    }
    window.grecaptcha.ready(async () => {
      try {
        const token = await window.grecaptcha.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
          { action }
        );
        resolve(token);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+225");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — jamais rempli par un humain
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const recaptchaToken = await getRecaptchaToken("register");

      const res = await fetch("/api/auth/client/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password, recaptchaToken, website }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error === "EMAIL_ALREADY_USED" ? "Cet email est déjà utilisé."
          : data.error === "PHONE_ALREADY_USED" ? "Ce numéro est déjà utilisé."
          : "Une erreur est survenue. Vérifiez vos informations."
        );
        return;
      }

      router.push(`/verify-otp?clientId=${data.clientId}&purpose=REGISTER`);
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} />

      <AuthLayout title="Créez votre compte" subtitle="Commencez à personnaliser le site de votre mariage.">
        <GoogleButton />

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-foreground/50">ou avec votre email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Honeypot : hors-écran + aria-hidden, jamais display:none seul */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="website">Site web</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm text-foreground/70">Nom complet</label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-foreground/70">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm text-foreground/70">Téléphone (format +225XXXXXXXXXX)</label>
            <input
              id="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-foreground/70">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors disabled:opacity-60"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>

          <p className="text-xs text-foreground/40 text-center">
            Ce site est protégé par reCAPTCHA. Les{" "}
            <a href="https://policies.google.com/privacy" className="underline">règles de confidentialité</a> et{" "}
            <a href="https://policies.google.com/terms" className="underline">conditions d'utilisation</a> de Google s'appliquent.
          </p>

          <p className="text-sm text-foreground/60 text-center mt-2">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-gold font-medium">Se connecter</Link>
          </p>
        </form>
      </AuthLayout>
    </>
  );
}