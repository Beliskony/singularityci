// ============ app/(dashboard)/dashboard/page.tsx ============
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { IClientAuthPayload, ISiteRsvpSummary } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";
import { ISite, SiteStatus } from "@/app/server/sites/ISite";
//import { SiteStatusBadge } from "@/app/frontend/components/dashboard/SiteStatusBadge";

const JWT_SECRET = process.env.JWT_SECRET!;

function formatEventDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function siteUrl(subdomain: string): string {
  return `https://${subdomain}.singularity.ci`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) redirect("/login");

  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    redirect("/login");
  }

  const clientService = getClientService();
  const [client, sites] = await Promise.all([
    clientService.getProfile(session.clientId),
    clientService.listMySites(session.clientId),
  ]);

  // Résumé RSVP (formulaires / confirmés / absents) uniquement pour les sites
  // qui ont pu recevoir des réponses. Un échec sur un site ne doit pas casser
  // toute la page : on retombe sur null et la carte affiche un tiret.
  const summaries = await Promise.all(
    sites.map(async (site) => {
      if (site.status !== SiteStatus.ACTIVE && site.status !== SiteStatus.EXPIRED) return null;
      try {
        return await clientService.getSiteRsvpSummary(session.clientId, site.id);
      } catch {
        return null;
      }
    })
  );

  return (
    <div className="min-h-dvh bg-background px-6 py-10 md:py-14">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-foreground/50">Bienvenue,</p>
            <h1 className="font-display italic text-3xl text-foreground">{client.fullName}</h1>
          </div>

          {/* Un site se crée depuis l'accueil (choix du template) : le dashboard
              sert à gérer les sites déjà créés. */}
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors"
          >
            + Choisir un template
          </Link>
        </div>

        <div className="mt-10">
          {sites.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {sites.map((site, i) => (
                <SiteCard key={site.id} site={site} summary={summaries[i]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border px-8 py-16 text-center">
      <p className="font-display italic text-xl text-foreground">Vous n&apos;avez pas encore de site</p>
      <p className="mt-2 text-foreground/60">
        Choisissez un modèle et créez le site de votre mariage en quelques minutes.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block px-6 py-3 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors"
      >
        Choisir mon premier template
      </Link>
    </div>
  );
}

function SiteCard({ site, summary }: { site: ISite; summary: ISiteRsvpSummary | null }) {
  const canPay = site.status === SiteStatus.DRAFT || site.status === SiteStatus.PENDING_PAYMENT;
  const isActive = site.status === SiteStatus.ACTIVE;
  const hasRsvpData = site.status === SiteStatus.ACTIVE || site.status === SiteStatus.EXPIRED;

  return (
    <div className="rounded-2xl border border-border p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display italic text-xl text-foreground">
            {site.groomName} &amp; {site.brideName}
          </h2>
          <p className="text-sm text-foreground/60 mt-0.5">{formatEventDate(site.eventDate)}</p>
        </div>
        {/* <SiteStatusBadge status={site.status} /> */}
      </div>

      {isActive && (
        <a
          href={siteUrl(site.subdomain)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gold hover:underline break-all"
        >
          {site.subdomain}.singularity.ci ↗
        </a>
      )}

      {hasRsvpData ? (
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-foreground/5 p-3 text-center">
          <Stat label="Réponses" value={summary?.submissionsCount} />
          <Stat label="Présents" value={summary?.confirmedGuestsCount} />
          <Stat label="Absents" value={summary?.absentGuestsCount} />
        </div>
      ) : (
        <p className="text-sm text-foreground/50">
          Les réponses de vos invités apparaîtront ici une fois le site publié.
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-2">
        <Link
          href={`/dashboard/sites/${site.id}`}
          className="flex-1 text-center px-4 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-gold hover:text-foreground transition-colors"
        >
          Gérer
        </Link>

        {canPay && (
          <Link
            href={`/dashboard/sites/${site.id}/payer`}
            className="flex-1 text-center px-4 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-foreground/40 transition-colors"
          >
            Finaliser le paiement
          </Link>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div>
      <p className="text-xl font-semibold text-foreground">{value ?? "—"}</p>
      <p className="text-xs text-foreground/50">{label}</p>
    </div>
  );
}