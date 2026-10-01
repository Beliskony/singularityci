// ============ app/api/public/templates/route.ts ============
import { NextResponse } from "next/server";
import { getTemplateService } from "@/app/server/templates/template.container";

// Publique : le catalogue de templates doit être visible avant tout login/paiement
export async function GET() {
  try {
    const templateService = getTemplateService();
    const templates = await templateService.listActiveTemplates();
    return NextResponse.json({ templates });
  } catch (err) {
    console.error("list templates error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}