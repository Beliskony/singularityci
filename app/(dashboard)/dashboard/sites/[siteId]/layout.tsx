// ============ app/(dashboard)/dashboard/sites/[siteId]/layout.tsx ============
// En-tête commun (noms, statut, onglets) pour toutes les pages d'un site, et
// garde de propriété : un site inconnu → 404, le site d'un autre client → /dashboard.
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";
import { SiteStatus } from "@/app/server/sites/ISite";
//import { SiteStatusBadge } from "@/app/frontend/components/dashboard/SiteStatusBadge";
import { SiteTabs } from "@/app/frontend/components/dashboard/SiteTabs";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function SiteHubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) redirect("/login");

  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    redirect("/login");
  }

  let site;
  try {
    site = await getClientService().getMySite(session.clientId, siteId);
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") notFound();
    if (error instanceof Error && error.name === "OwnershipError") redirect("/dashboard");
    throw error;
  }

  const needsPayment = site.status === SiteStatus.DRAFT || site.status === SiteStatus.PENDING_PAYMENT;

  return (
    <div className="px-6 pt-8 md:pt-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="text-sm text-foreground/50 hover:text-gold transition-colors">
          ← Mes sites
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display italic text-3xl text-foreground">
            {site.groomName} &amp; {site.brideName}
          </h1>
          {/* <SiteStatusBadge status={site.status} /> */}
        </div>

        <SiteTabs
          siteId={site.id}
          showPayment={needsPayment}
          paymentLabel="Paiement"
        />
      </div>

      <div className="max-w-5xl mx-auto py-8 md:py-10">{children}</div>
    </div>
  );
}