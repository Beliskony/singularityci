// ============ app/frontend/components/dashboard/TemplateLivePreview.tsx ============
"use client";

import { useEffect, useRef } from "react";
import type { LivePreviewData } from "../../types/LivePreviewData";

interface Props {
  slug: string;
  data: LivePreviewData;
}

// Cadre de téléphone + iframe vers /apercu-live/[slug]. Les données sont
// envoyées par postMessage (même origine) à chaque modification : l'iframe
// n'est jamais rechargée, donc le défilement et l'écran d'intro sont conservés.
export function TemplateLivePreview({ slug, data }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const latestRef = useRef(data);
  latestRef.current = data;

  function send(type: "preview-props" | "preview-replay-intro") {
    const win = iframeRef.current?.contentWindow;
    if (!win || !readyRef.current) return;
    win.postMessage(type === "preview-props" ? { type, props: latestRef.current } : { type }, window.location.origin);
  }

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.type === "preview-ready") {
        readyRef.current = true;
        send("preview-props");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Petit debounce : évite de renvoyer l'objet à chaque frappe pendant un glissement de couleur.
  useEffect(() => {
    const t = setTimeout(() => send("preview-props"), 120);
    return () => clearTimeout(t);
  }, [data]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-93.75 max-w-full h-180 max-h-[calc(100dvh-7rem)] rounded-[2.5rem] border-10 border-foreground/90 bg-black shadow-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          src={`/apercu-live/${slug}`}
          title="Aperçu de votre site"
          className="w-full h-full bg-white"
        />
      </div>
      <button
        type="button"
        onClick={() => send("preview-replay-intro")}
        className="text-xs text-foreground/50 hover:text-gold transition-colors"
      >
        ↻ Rejouer l&apos;introduction
      </button>
    </div>
  );
}