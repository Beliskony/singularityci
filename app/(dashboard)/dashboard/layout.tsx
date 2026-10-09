// ============ app/(dashboard)/dashboard/layout.tsx ============
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { IClientAuthPayload } from "@/app/server/client/IClient";
import { getClientService } from "@/app/server/client/client.container";
import { DashboardSidebar } from "@/app/frontend/components/dashboard/DashboardSidebar";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-dvh flex bg-background">
      <DashboardSidebar client={{ fullName: client.fullName, email: client.email }} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}