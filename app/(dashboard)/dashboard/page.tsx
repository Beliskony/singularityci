// ============ app/(dashboard)/dashboard/page.tsx ============
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";
import { ISite, SiteStatus } from "@/app/server/sites/ISite";

const JWT_SECRET = process.env.JWT_SECRET!;

const STATUS_LABEL: Record<SiteStatus, string> = {
  [SiteStatus.DRAFT]: "Brouillon",
  [SiteStatus.PENDING_PAYMENT]: "En attente de paiement",
  [SiteStatus.ACTIVE]: "Actif",
  [SiteStatus.EXPIRED]: "Expiré",
  [SiteStatus.ARCHIVED]: "Archivé",
};

const STATUS_STYLE: Record<SiteStatus, string> = {
  [SiteStatus.DRAFT]: "bg-foreground/10 text-foreground/70",
  [SiteStatus.PENDING_PAYMENT]: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  [SiteStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  [SiteStatus.EXPIRED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  [SiteStatus.ARCHIVED]: "bg-foreground/10 text-foreground/50",
};

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

  return (
    <div className="min-h-dvh bg-background px-6 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-foreground/50">Bienvenue,</p>
            <h1 className="font-display italic text-3xl text-foreground">{client.fullName}</h1>
          </div>

          {/* La création d'un site se fait depuis l'accueil (choix + paiement
              du template) — le dashboard ne sert qu'à payer/personnaliser/
              renouveler un site déjà créé, jamais à en démarrer un nouveau. */}
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
              {sites.map((site) => (
                <SiteCard key={site.id} site={site} />
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
      <p className="font-display italic text-xl text-foreground">Vous n'avez pas encore de site</p>
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

function SiteCard({ site }: { site: ISite }) {
  const canPay = site.status === SiteStatus.DRAFT || site.status === SiteStatus.PENDING_PAYMENT;
  const isActive = site.status === SiteStatus.ACTIVE;
  const isExpired = site.status === SiteStatus.EXPIRED;

  return (
    <div className="rounded-2xl border border-border p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display italic text-xl text-foreground">
            {site.groomName} &amp; {site.brideName}
          </h2>
          <p className="text-sm text-foreground/60 mt-0.5">{formatEventDate(site.eventDate)}</p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[site.status]}`}>
          {STATUS_LABEL[site.status]}
        </span>
      </div>

      {isActive && (
        <a
          href={siteUrl(site.subdomain)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gold hover:underline break-all"
        >
          {site.subdomain}.singularity.ci
        </a>
      )}

      <div className="flex items-center gap-4 text-sm text-foreground/60">
        <span>
          <strong className="text-foreground">{site.rsvpCount}</strong> réponse{site.rsvpCount === 1 ? "" : "s"} RSVP
        </span>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-2">
        {canPay && (
          <Link
            href={`/dashboard/sites/${site.id}/payer`}
            className="flex-1 text-center px-4 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-gold hover:text-foreground transition-colors"
          >
            Finaliser le paiement
          </Link>
        )}

        {isActive && (
          <Link
            href={`/dashboard/sites/${site.id}/personnaliser`}
            className="flex-1 text-center px-4 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-foreground/40 transition-colors"
          >
            Personnaliser
          </Link>
        )}

        {isExpired && (
          <Link
            href={`/dashboard/sites/${site.id}/payer`}
            className="flex-1 text-center px-4 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-foreground/40 transition-colors"
          >
            Renouveler
          </Link>
        )}
      </div>
    </div>
  );
}