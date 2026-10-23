// ============ app/frontend/components/templates/TemplatePreviewClient.tsx ============
"use client";

import { getTemplateComponent, getTemplateDemoProps } from "@/app/frontend/components/templates/registry";

interface TemplatePreviewClientProps {
  slug: string;
}

const TemplatePreviewClient = ({ slug }: TemplatePreviewClientProps) => {
  let TemplateComponent;
  try {
    TemplateComponent = getTemplateComponent(slug);
  } catch {
    return null; // le Server Component parent a déjà fait notFound() sur un slug invalide
  }

  const demoProps = getTemplateDemoProps(slug);
  if (!demoProps) return null;

  const fullDemoProps = {
    ...demoProps,
    onSubmitRsvp: async (data: unknown) => {
      console.log("[Aperçu] RSVP simulé :", data);
      await new Promise((resolve) => setTimeout(resolve, 600));
      alert("Ceci est un aperçu : le RSVP n'est pas réellement envoyé.");
    },
  };

  return (
    <div className="relative">
      <div className="sticky top-0 z-50 w-full bg-black text-white text-center text-sm py-2">
        Aperçu - ceci n'est pas un site publié
      </div>
      <TemplateComponent {...fullDemoProps} />
    </div>
  );
};

export default TemplatePreviewClient;