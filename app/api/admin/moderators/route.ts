// ============ app/api/admin/moderators/route.ts ============
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createModeratorSchema } from "@/app/server/admin/AdminSchemaZod";
import { IAdminAuthPayload } from "@/app/server/admin/IAdmin";
import { getAdminService } from "@/app/server/admin/admin.container";

const JWT_SECRET = process.env.JWT_SECRET!;

async function requireAdmin(): Promise<IAdminAuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as IAdminAuthPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  try {
    const adminService = getAdminService();
    const moderators = await adminService.listModerators(session);
    return NextResponse.json({ moderators });
  } catch (err) {
    if (err instanceof Error && err.name === "ForbiddenError") {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("list moderators error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const parsed = createModeratorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const adminService = getAdminService();
    const moderator = await adminService.createModerator(session, parsed.data);
    const { passwordHash, ...safeModerator } = moderator;
    return NextResponse.json({ moderator: safeModerator }, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.name) {
        case "ForbiddenError":
          return NextResponse.json({ error: err.message }, { status: 403 });
        case "BusinessRuleError":
          return NextResponse.json({ error: err.message }, { status: 400 });
        default:
          break;
      }
    }
    console.error("create moderator error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}