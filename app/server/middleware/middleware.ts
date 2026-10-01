// ============ middleware.ts ============
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  // ex: "aissatou-karim.singularity.ci" → "aissatou-karim"
  const subdomain = hostname.split(".")[0];

  const isMainDomain = hostname === "singularity.ci" || hostname === "www.singularity.ci";
  const isAdminOrDashboard = hostname.startsWith("app.") || hostname.startsWith("admin.");

  if (!isMainDomain && !isAdminOrDashboard && subdomain) {
    const url = request.nextUrl.clone();
    url.pathname = `/site/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}