import { NextResponse, type NextRequest } from "next/server";
import { slugFromHost } from "@/lib/tenant/store";

/**
 * Resolves the tenant from the request host and forwards it to the app as the
 * `x-tenant-slug` header, so Server Components / Route Handlers can read it
 * cheaply via lib/tenant/server.ts.
 *
 * Local dev: use a subdomain of localhost (e.g. http://pawsandstay.localhost:3000)
 * or append ?tenant=<slug> to any URL to preview a specific tenant.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const override = request.nextUrl.searchParams.get("tenant");
  const slug = override || slugFromHost(host);

  const requestHeaders = new Headers(request.headers);
  if (slug) requestHeaders.set("x-tenant-slug", slug);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
