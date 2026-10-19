// ============ app/(dashboard)/dashboard/sites/[siteId]/page.tsx ============
// Vue d'ensemble : prochaine action selon le statut, lien du site, chiffres RSVP.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";
import { SiteStatus } from "@/app/server/sites/ISite";
import { CopyLinkButton } from "@/app/frontend/components/dashboard/CopyLinkButton";

const JWT_SECRET = process.env.JWT_SECRET!;

function fmt(date?: Date | string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function SiteOverviewPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;

  const token = (await cookies()).get("client_session")?.value;
  if (!token) redirect("/login");
  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    redirect("/login");
  }

  const clientService = getClientService();
  const site = await clientService.getMySite(session.clientId, siteId); // le layout a déjà validé l'accès

  const liveUrl = `https://${site.subdomain}.singularity.ci`;
  const isActive = site.status === SiteStatus.ACTIVE;
  const showRsvp = isActive || site.status === SiteStatus.EXPIRED;

  const summary = showRsvp
    ? await clientService.getSiteRsvpSummary(session.clientId, siteId).catch(() => null)
    : null;

  const whatsappText = encodeURIComponent(
    `Nous avons le plaisir de vous inviter à notre mariage ! Retrouvez tous les détails et confirmez votre présence ici : ${liveUrl}`
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <NextStep status={site.status} siteId={site.id} />

        {isActive && (
          <section className="rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-display italic text-xl text-foreground">Votre site est en ligne</h2>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="block text-gold hover:underline break-all">
              {site.subdomain}.singularity.ci ↗
            </a>
            <div className="flex flex-wrap gap-2">
              <CopyLinkButton url={liveUrl} />
              <a
                href={`https://wa.me/?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-foreground text-background text-sm hover:bg-gold hover:text-foreground transition-colors"
              >
                Partager sur WhatsApp
              </a>
            </div>
          </section>
        )}

        {showRsvp && (
          <section className="rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display italic text-xl text-foreground">Réponses des invités</h2>
              <Link href={`/dashboard/sites/${site.id}/invites`} className="text-sm text-gold hover:underline">
                Voir le détail →
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Big label="Réponses reçues" value={summary?.submissionsCount} />
              <Big label="Personnes présentes" value={summary?.confirmedGuestsCount} />
              <Big label="Personnes absentes" value={summary?.absentGuestsCount} />
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-border p-6 space-y-3 text-sm">
          <h2 className="font-display italic text-xl text-foreground">Informations</h2>
          <Row label="Date du mariage" value={fmt(site.eventDate)} />
          <Row label="Adresse" value={`${site.subdomain}.singularity.ci`} />
          {site.purchasedAt && <Row label="Publié le" value={fmt(site.purchasedAt)} />}
          {site.expiresAt && <Row label="En ligne jusqu'au" value={fmt(site.expiresAt)} />}
        </section>

        <Link
          href={`/dashboard/sites/${site.id}/personnaliser`}
          className="block text-center px-5 py-3 rounded-full border border-border text-foreground font-medium hover:border-foreground/40 transition-colors"
        >
          Personnaliser mon site
        </Link>
      </aside>
    </div>
  );
}

function NextStep({ status, siteId }: { status: SiteStatus; siteId: string }) {
  const cfg: Partial<Record<SiteStatus, { title: string; text: string; cta: string; href: string }>> = {
    [SiteStatus.DRAFT]: {
      title: "Personnalisez puis publiez",
      text: "Votre site est en brouillon : il n'est visible que de vous. Personnalisez-le à votre goût, puis réglez pour le mettre en ligne.",
      cta: "Finaliser le paiement",
      href: `/dashboard/sites/${siteId}/payer`,
    },
    [SiteStatus.PENDING_PAYMENT]: {
      title: "Paiement en attente",
      text: "Votre paiement n'a pas encore été confirmé. Vous pouvez le relancer à tout moment.",
      cta: "Reprendre le paiement",
      href: `/dashboard/sites/${siteId}/payer`,
    },
    [SiteStatus.EXPIRED]: {
      title: "Site expiré",
      text: "Votre site n'est plus visible par vos invités. Vos réponses restent consultables. Le renouvellement en ligne arrive bientôt.",
      cta: "",
      href: "",
    },
    [SiteStatus.ARCHIVED]: {
      title: "Site archivé",
      text: "Ce site a été archivé : ses photos ont été supprimées et il n'est plus modifiable.",
      cta: "",
      href: "",
    },
  };
  const step = cfg[status];
  if (!step) return null;

  return (
    <section className="rounded-2xl border border-gold/40 bg-gold/10 p-6">
      <h2 className="font-display italic text-xl text-foreground">{step.title}</h2>
      <p className="mt-2 text-sm text-foreground/70">{step.text}</p>
      {step.cta && (
        <Link
          href={step.href}
          className="mt-4 inline-block px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-gold hover:text-foreground transition-colors"
        >
          {step.cta}
        </Link>
      )}
    </section>
  );
}

function Big({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-xl bg-foreground/5 py-4">
      <p className="text-3xl font-semibold text-foreground">{value ?? "—"}</p>
      <p className="mt-1 text-xs text-foreground/50">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-foreground/50">{label}</span>
      <span className="text-foreground text-right break-all">{value}</span>
    </div>
  );
}