import { cookies } from "next/headers";

import {
  AUTH_COOKIE,
  SESSION_MAX_AGE,
  signAdminToken,
  verifyAdminToken,
} from "@/lib/auth-token";
import { prisma } from "@/lib/prisma";

export { AUTH_COOKIE, SESSION_MAX_AGE, signAdminToken, verifyAdminToken };

/** The admin as the dashboard sees them. No passwordHash, ever. */
export type CurrentAdmin = {
  id: string;
  email: string;
  name: string | null;
};

/* Node-runtime side of the session: writing cookies and reading the admin
   row. The proxy imports src/lib/auth-token.ts instead, which carries
   neither next/headers nor Prisma. */

/** httpOnly so no script can read it, sameSite lax so a normal top-level
    navigation back to /admin still carries it, secure once we're on
    HTTPS. Only a route handler or server function may call this. */
export async function setAuthCookie(token: string) {
  const store = await cookies();

  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();

  /* Overwrite before deleting: an expired empty cookie replaces the token
     even where the delete alone would be dropped. */
  store.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  store.delete(AUTH_COOKIE);
}

/** The signed-in admin, or null. Verifies the token *and* re-reads the
    row, so a deleted admin cannot keep browsing on an old cookie. Safe in
    server components and route handlers on the Node runtime. */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const store = await cookies();
  const payload = await verifyAdminToken(store.get(AUTH_COOKIE)?.value);

  if (!payload) return null;

  try {
    return await prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true },
    });
  } catch (error) {
    console.error("[auth] failed to load the current admin", error);
    return null;
  }
}
