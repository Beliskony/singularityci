// ============ app/(auth)/login/page.tsx ============
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/app/frontend/components/principal/auth/AuthLayout";
import { GoogleButton } from "@/app/frontend/components/principal/auth/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          res.status === 423
            ? "Compte temporairement verrouillé suite à plusieurs tentatives. Réessayez plus tard."
            : data.error === "ACCOUNT_USES_GOOGLE_LOGIN"
            ? "Ce compte a été créé avec Google. Utilisez le bouton Google ci-dessus."
            : "Email ou mot de passe incorrect."
        );
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Bon retour" subtitle="Connectez-vous pour retrouver votre site de mariage.">
      <GoogleButton />

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-foreground/50">ou avec votre email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm text-foreground/70">Mot de passe</label>
            <Link href="/forgot-password" className="text-xs text-gold">Oublié ?</Link>
          </div>
          <input
            id="password"
            type="password"
            required
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
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="text-sm text-foreground/60 text-center mt-2">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-gold font-medium">Créer un compte</Link>
        </p>
      </form>
    </AuthLayout>
  );
}