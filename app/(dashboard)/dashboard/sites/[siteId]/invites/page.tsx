// ============ app/(dashboard)/dashboard/sites/[siteId]/invites/page.tsx ============
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";
import { RsvpRepositoryImpl } from "@/app/server/rsvp/Rsvp.repository";
import { SiteStatus } from "@/app/server/sites/ISite";
import { GuestList, GuestRow } from "@/app/frontend/components/dashboard/GuestList";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function InvitesPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;

  const token = (await cookies()).get("client_session")?.value;
  if (!token) redirect("/login");
  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    redirect("/login");
  }

  // getMySite vérifie la propriété avant toute lecture des réponses.
  const site = await getClientService().getMySite(session.clientId, siteId);

  if (site.status === SiteStatus.DRAFT || site.status === SiteStatus.PENDING_PAYMENT) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-8 py-16 text-center">
        <p className="font-display italic text-xl text-foreground">Pas encore de réponses</p>
        <p className="mt-2 text-foreground/60">
          Les invités pourront répondre dès que votre site sera publié.
        </p>
      </div>
    );
  }

  const rsvps = await new RsvpRepositoryImpl().findBySiteId(siteId);

  const rows: GuestRow[] = rsvps.map((r) => ({
    id: r.id,
    guestName: r.guestName,
    guestPhone: r.guestPhone ?? "",
    guestEmail: r.guestEmail ?? "",
    numberOfGuests: r.numberOfGuests,
    status: r.status,
    message: r.message ?? "",
    respondedAt: new Date(r.respondedAt).toISOString(),
  }));

  return <GuestList rows={rows} fileName={`invites-${site.subdomain}`} />;
}