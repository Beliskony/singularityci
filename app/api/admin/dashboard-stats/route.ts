// ============ app/api/admin/dashboard-stats/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { IAdminAuthPayload } from "@/app/server/admin/IAdmin";
import { getAdminService } from "@/app/server/admin/admin.container";

const JWT_SECRET = process.env.JWT_SECRET!;

const queryParamsSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  let session: IAdminAuthPayload;
  try {
    session = jwt.verify(token, JWT_SECRET) as IAdminAuthPayload;
  } catch {
    return NextResponse.json({ error: "INVALID_SESSION" }, { status: 401 });
  }

  // Les query params viennent de l'URL, pas d'un body JSON
  const { searchParams } = new URL(request.url);
  const parsed = queryParamsSchema.safeParse({
    from: searchParams.get("from"),
    to: searchParams.get("to"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const adminService = getAdminService();
    const stats = await adminService.getDashboardStats(session, {
      from: parsed.data.from,
      to: parsed.data.to,
    });
    return NextResponse.json({ stats });
  } catch (err) {
    if (err instanceof Error && err.name === "ForbiddenError") {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("dashboard stats error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}