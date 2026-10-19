// ============ app/apercu-live/[slug]/page.tsx ============
// Page chargée DANS l'iframe de l'aperçu du dashboard. Elle affiche le vrai
// template et se met à jour à chaque message `preview-props` du parent.
// Pourquoi une iframe : les media queries Tailwind (md:, lg:) du template se
// calculent sur la largeur de l'iframe (≈ 390 px = téléphone), pas sur celle du
// dashboard — c'est la seule façon d'avoir un aperçu mobile fidèle.
"use client";

import { use, useEffect, useMemo, useState } from "react";
import type { LivePreviewData } from "@/app/frontend/types/LivePreviewData";
import { getTemplateComponent, getTemplateDemoProps } from "@/app/frontend/components/templates/registry";

export default function LivePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<LivePreviewData | null>(null);
  const [introKey, setIntroKey] = useState(0);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "preview-props") setData(e.data.props as LivePreviewData);
      if (e.data?.type === "preview-replay-intro") setIntroKey((k) => k + 1);
    }
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const resolved = useMemo(() => {
    try {
      return { Template: getTemplateComponent(slug), demo: getTemplateDemoProps(slug) };
    } catch {
      return null;
    }
  }, [slug]);

  if (!resolved) return <p style={{ padding: 24, fontFamily: "sans-serif" }}>Modèle introuvable.</p>;

  const { Template, demo } = resolved;
  const d = data;

  // Les champs vides retombent sur la démo (images) ou sur le défaut du template (textes).
  const nonEmpty = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== ""));

  const props = {
    ...demo,
    ...(d
      ? {
          groomName: d.groomName || demo?.groomName,
          brideName: d.brideName || demo?.brideName,
          eventDate: d.eventDate ? new Date(d.eventDate) : demo?.eventDate,
          themeColors: d.themeColors,
          customTexts: { ...demo?.customTexts, ...nonEmpty(d.customTexts) },
          programItems: d.programItems.length > 0 ? d.programItems : demo?.programItems,
          heroImage: d.heroImage || demo?.heroImage,
          galleryImages: d.galleryImages.length > 0 ? d.galleryImages : demo?.galleryImages,
          venueImages: d.venueImages.length > 0 ? d.venueImages : demo?.venueImages,
        }
      : {}),
    // Aperçu : aucune vraie soumission.
    async onSubmitRsvp() {},
  };

  // `key` : rejoue l'écran d'introduction à la demande, sans perdre l'état du parent.
  return <Template key={introKey} {...(props as React.ComponentProps<typeof Template>)} />;
}