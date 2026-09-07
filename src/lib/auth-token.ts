import { SignJWT, jwtVerify } from "jose";

/** Session cookie name. Anything reading the session goes through the
    helpers here rather than hard-coding it. */
export const AUTH_COOKIE = "alfahdar_admin";

/** Session lifetime, in seconds. The cookie's maxAge and the token's `exp`
    are both derived from this so they can never drift apart. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const ISSUER = "alfahdar";
const AUDIENCE = "alfahdar-admin";

/** What we put in the token: the id we look the admin up by, and the email
    for display. Never a password hash, never a role we don't check. */
export type AdminTokenPayload = {
  sub: string;
  email: string;
};

/* This module is deliberately free of Prisma and next/headers: the proxy
   (Edge-capable) imports it, and pulling either of those in would break
   there. Cookie writing and database lookups live in src/lib/auth.ts. */

const encoder = new TextEncoder();

/** Throws rather than falling back to a default: a missing secret must
    fail loudly at request time, never sign tokens anyone could forge.
    The message names the variable and never its value. */
function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. The admin session cannot be signed or verified.",
    );
  }

  return encoder.encode(secret);
}

export async function signAdminToken(payload: AdminTokenPayload) {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

/** null for anything that isn't a valid, unexpired token we issued —
    tampered, wrong secret, wrong issuer, or simply absent. Callers treat
    null as logged out; there is no other failure mode to handle. */
export async function verifyAdminToken(
  token: string | undefined | null,
): Promise<AdminTokenPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    const email = payload.email;
    if (!payload.sub || typeof email !== "string") return null;

    return { sub: payload.sub, email };
  } catch {
    return null;
  }
}
