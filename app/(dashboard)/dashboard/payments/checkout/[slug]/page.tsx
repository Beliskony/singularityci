// ============ app/payments/checkout/[slug]/page.tsx ============
// Tunnel d'achat : connexion (si besoin) → infos du site → paiement → dashboard.
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";
import { SiteStatus } from "@/app/server/sites/ISite";
import { findActiveTemplateBySlug } from "@/app/server/templates/Template.Catalog";
import { PurchaseFlow } from "@/app/frontend/components/purchase/PurchaseFlow";
import { formatPrice } from "@/app/frontend/components/purchase/BuyButton";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function BuyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const template = await findActiveTemplateBySlug(slug);
  if (!template) notFound();

  // 1) Pas connecté → page d'authentification, avec retour ici ensuite.
  const token = (await cookies()).get("client_session")?.value;
  const nextUrl = encodeURIComponent(`/payments/checkout/${slug}`);
  if (!token) redirect(`/register?next=${nextUrl}`);

  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    redirect(`/login?next=${nextUrl}`);
  }

  // 2) Un brouillon (ou paiement en attente) existe déjà pour ce template :
  //    on le réutilise au lieu d'en créer un second à chaque clic sur « Acheter ».
  const sites = await getClientService().listMySites(session.clientId);
  const pending = sites.find(
    (s) => s.templateId === template.id && (s.status === SiteStatus.DRAFT || s.status === SiteStatus.PENDING_PAYMENT)
  );

  return (
    <div className="min-h-dvh bg-background px-6 py-12 md:py-16">
      <div className="max-w-5xl mx-auto grid gap-10 md:grid-cols-[1fr_380px]">
        <div>
          <Link href="/#modeles" className="text-sm text-foreground/50 hover:text-gold transition-colors">
            ← Tous les modèles
          </Link>
          <h1 className="mt-3 font-display italic text-3xl md:text-4xl text-foreground">
            Votre site « {template.name} »
          </h1>

          <PurchaseFlow
            template={{ id: template.id, slug: template.slug, name: template.name }}
            pendingSite={
              pending
                ? { id: pending.id, groomName: pending.groomName, brideName: pending.brideName }
                : null
            }
          />
        </div>

        <aside className="md:sticky md:top-8 h-fit rounded-2xl border border-border p-6 space-y-4">
          <p className="text-sm text-foreground/50">Récapitulatif</p>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display italic text-xl text-foreground">{template.name}</p>
            <p className="text-lg font-semibold text-foreground">{formatPrice(template.priceXof)}</p>
          </div>
          {template.description && <p className="text-sm text-foreground/60">{template.description}</p>}
          <ul className="text-sm text-foreground/70 space-y-1.5">
            <li>✓ Site en ligne jusqu&apos;à la date du mariage</li>
            <li>✓ Confirmations de présence centralisées</li>
            <li>✓ Personnalisation illimitée</li>
          </ul>
          <Link href={`/apercu/${template.slug}`} target="_blank" className="block text-sm text-gold hover:underline">
            Revoir l&apos;aperçu ↗
          </Link>
        </aside>
      </div>
    </div>
  );
}