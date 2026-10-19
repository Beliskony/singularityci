// ============ app/(dashboard)/dashboard/sites/[siteId]/payer/page.tsx ============
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";
import { SiteStatus } from "@/app/server/sites/ISite";
import { PayerForm } from "@/app/frontend/components/dashboard/PayerForm";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function PayerPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;

  const token = (await cookies()).get("client_session")?.value;
  if (!token) redirect("/login");
  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    redirect("/login");
  }

  const site = await getClientService().getMySite(session.clientId, siteId);

  // Déjà payé : rien à faire ici.
  if (site.status === SiteStatus.ACTIVE) redirect(`/dashboard/sites/${siteId}`);

  // Le service n'accepte un paiement que pour DRAFT / PENDING_PAYMENT
  // (SITE_NOT_PAYABLE_IN_CURRENT_STATUS) : on n'affiche pas un formulaire
  // voué à l'échec pour un site expiré ou archivé.
  if (site.status !== SiteStatus.DRAFT && site.status !== SiteStatus.PENDING_PAYMENT) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <h2 className="font-display italic text-2xl text-foreground">
          {site.status === SiteStatus.EXPIRED ? "Renouvellement bientôt disponible" : "Site archivé"}
        </h2>
        <p className="mt-3 text-foreground/60">
          {site.status === SiteStatus.EXPIRED
            ? "Le renouvellement en ligne n'est pas encore ouvert. Contactez-nous pour réactiver votre site."
            : "Ce site a été archivé et ne peut plus être payé."}
        </p>
        <Link href={`/dashboard/sites/${siteId}`} className="mt-6 inline-block text-gold hover:underline">
          Retour à la vue d&apos;ensemble
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-display italic text-2xl text-foreground">Finaliser votre site</h2>
      <p className="mt-2 text-foreground/60">
        Choisissez votre mode de paiement. Le montant exact s&apos;affiche sur la page de paiement sécurisée.
      </p>
      <PayerForm siteId={siteId} />
    </div>
  );
}