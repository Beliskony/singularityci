// ============ app/(dashboard)/dashboard/account/page.tsx ============
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";
import { AccountForms } from "@/app/frontend/components/dashboard/AccountForms";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("client_session")?.value;
  if (!token) redirect("/login");

  let session: IClientAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IClientAuthPayload;
  } catch {
    redirect("/login");
  }

  const client = await getClientService().getProfile(session.clientId);

  return (
    <div className="min-h-dvh bg-background px-6 py-10 md:py-14">
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-foreground/50">Mon compte</p>
        <h1 className="font-display italic text-3xl text-foreground">{client.fullName}</h1>
        <p className="mt-1 text-sm text-foreground/60">{client.email}</p>

        <AccountForms initial={{ fullName: client.fullName, phone: client.phone ?? "" }} />
      </div>
    </div>
  );
}