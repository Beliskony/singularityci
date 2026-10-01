// ============ frontend/components/principal/auth/GoogleButton.tsx ============
"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GoogleButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          setError(null);
          try {
            const res = await fetch("/api/auth/client/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: credentialResponse.credential }),
            });
            const data = await res.json();

            if (!res.ok) {
              setError("Connexion Google impossible. Réessayez.");
              return;
            }

            router.push(data.isNewAccount ? "/onboarding/phone" : "/dashboard");
          } catch {
            setError("Impossible de contacter le serveur.");
          }
        }}
        onError={() => setError("Connexion Google impossible. Réessayez.")}
        theme="outline"
        shape="pill"
        text="continue_with"
      />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}