// ============ app/apercu/[slug]/page.tsx ============
import { notFound } from "next/navigation";
import { getTemplateComponent } from "@/app/frontend/components/templates/registry";
import  TemplatePreviewClient  from "@/app/frontend/components/templates/TemplatePreviewClient";

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Valide tôt côté serveur que le slug existe dans le registry — si ce
  // n'est pas le cas, 404 immédiate sans même descendre au client.
  try {
    getTemplateComponent(slug);
  } catch {
    notFound();
  }

  // On ne passe que le slug (une string, sérialisable) au client — jamais
  // le composant ni les handlers, qui doivent vivre côté client.
  return <TemplatePreviewClient slug={slug} />;
}