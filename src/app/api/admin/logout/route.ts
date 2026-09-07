import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

/** POST, not GET: a link prefetch or an <img> must never be able to log an
    admin out. Always succeeds — an already-cleared session is still the
    state the caller asked for. */
export async function POST() {
  await clearAuthCookie();

  return NextResponse.json({ success: true }, { status: 200 });
}
