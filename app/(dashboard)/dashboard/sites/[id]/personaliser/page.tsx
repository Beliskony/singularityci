// ============ app/(dashboard)/dashboard/sites/[siteId]/personnaliser/page.tsx ============
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { NotFoundError, OwnershipError } from "@/app/server/sites/Site.service";
import { getSiteService } from "@/app/server/sites/site.container";
import { SiteStatus } from "@/app/server/sites/ISite";
import { PersonnalisationForm } from "@/app/frontend/components/dashboard/PersonnalisationForm";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function PersonnaliserPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId: id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) redirect("/login");

  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    redirect("/login");
  }

  let data;
  try {
    data = await getSiteService().getSiteForEditing(session.clientId, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof OwnershipError) redirect("/dashboard");
    throw error;
  }

  const { site, images, fieldSchema } = data;

  // EXPIRED / ARCHIVED : Site.service.ts refuse toute modification
  // (SITE_NOT_EDITABLE_IN_CURRENT_STATUS) — on ne montre même pas le
  // formulaire, on oriente vers le renouvellement.
  if (site.status === SiteStatus.EXPIRED || site.status === SiteStatus.ARCHIVED) {
    return (
      <div className="min-h-dvh bg-background px-6 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display italic text-2xl text-foreground">
            Ce site n'est plus modifiable
          </h1>
          <p className="mt-3 text-foreground/60">
            {site.status === SiteStatus.EXPIRED
              ? "Son abonnement est arrivé à expiration. Renouvelez-le pour continuer à le personnaliser."
              : "Il a été archivé et ses photos ont été supprimées."}
          </p>
          {site.status === SiteStatus.EXPIRED && (
            <Link
              href={`/dashboard/sites/${site.id}/payer`}
              className="mt-6 inline-block px-6 py-3 rounded-full bg-foreground text-background font-medium hover:bg-gold hover:text-foreground transition-colors"
            >
              Renouveler
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background px-6 py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-foreground/50">Personnalisation</p>
            <h1 className="font-display italic text-3xl text-foreground">
              {site.groomName} &amp; {site.brideName}
            </h1>
          </div>
          {site.status === SiteStatus.ACTIVE && (
            <a
              href={`https://${site.subdomain}.singularity.ci`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gold hover:underline"
            >
              Voir le site en ligne ↗
            </a>
          )}
        </div>

        <PersonnalisationForm site={site} images={images} fieldSchema={fieldSchema} />
      </div>
    </div>
  );
}