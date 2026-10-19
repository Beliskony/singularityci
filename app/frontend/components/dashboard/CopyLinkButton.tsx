// ============ app/frontend/components/dashboard/CopyLinkButton.tsx ============
"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé) : on laisse l'URL visible à côté.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="px-4 py-2 rounded-full border border-border text-sm text-foreground hover:border-foreground/40 transition-colors"
    >
      {copied ? "Lien copié ✓" : "Copier le lien"}
    </button>
  );
}