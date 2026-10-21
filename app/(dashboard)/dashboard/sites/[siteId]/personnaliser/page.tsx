// ============ app/(dashboard)/dashboard/sites/[siteId]/personnaliser/page.tsx ============
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getSiteService } from "@/app/server/sites/site.container";
import { SiteStatus } from "@/app/server/sites/ISite";
import { PersonnalisationStudio } from "@/app/frontend/components/dashboard/PersonalisationStudion";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function PersonnaliserPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;

  const token = (await cookies()).get("client_session")?.value;
  if (!token) redirect("/login");
  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    redirect("/login");
  }

  let data;
  try {
    data = await getSiteService().getSiteForEditing(session.clientId, siteId);
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") notFound();
    if (error instanceof Error && error.name === "OwnershipError") redirect("/dashboard");
    throw error;
  }

  const { site, images, fieldSchema, templateSlug } = data;

  // Le service refuse toute modification d'un site EXPIRED / ARCHIVED.
  if (site.status === SiteStatus.EXPIRED || site.status === SiteStatus.ARCHIVED) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <h2 className="font-display italic text-2xl text-foreground">Ce site n&apos;est plus modifiable</h2>
        <p className="mt-3 text-foreground/60">
          {site.status === SiteStatus.EXPIRED
            ? "Son abonnement est arrivé à expiration."
            : "Il a été archivé et ses photos ont été supprimées."}
        </p>
      </div>
    );
  }

  return (
    <>
      {site.status !== SiteStatus.ACTIVE && (
        <p className="mb-6 rounded-xl bg-foreground/5 px-4 py-3 text-sm text-foreground/70">
          Vous pouvez personnaliser votre site dès maintenant ; il ne sera visible de vos invités qu&apos;après le paiement.
        </p>
      )}
      <PersonnalisationStudio site={site} images={images} fieldSchema={fieldSchema} templateSlug={templateSlug} />
    </>
  );
}