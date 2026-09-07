import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE, verifyAdminToken } from "@/lib/auth-token";

/* Next 16 renamed the `middleware` file convention to `proxy`; same
   behaviour, same matcher, new export name.

   The gate for the whole dashboard: no valid session, no /admin. It only
   imports the token helpers — no Prisma, no next/headers — so it stays
   light enough to run in front of every admin request. Pages still call
   getCurrentAdmin() for the admin's own data; this is the cheap first
   check, not the only one. */

const LOGIN_PATH = "/admin/login";
const DASHBOARD_PATH = "/admin";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  /* Invalid, expired or missing all collapse to the same thing: no session. */
  const session = await verifyAdminToken(token);

  if (pathname === LOGIN_PATH) {
    if (!session) return NextResponse.next();

    /* Already signed in: no reason to show the form again. */
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  if (session) return NextResponse.next();

  /* Remember where they were headed so the login can send them back. */
  const loginUrl = new URL(LOGIN_PATH, request.url);
  const from = `${pathname}${search}`;
  if (from !== DASHBOARD_PATH) loginUrl.searchParams.set("from", from);

  const response = NextResponse.redirect(loginUrl);
  /* A stale cookie would otherwise keep failing verification on every
     request; drop it now so the browser stops sending it. */
  if (token) response.cookies.delete(AUTH_COOKIE);

  return response;
}

/* Only the dashboard. The public site and the login/logout API handlers are
   never touched, and neither are static assets. */
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
