"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Clears the session cookie server-side, then leaves for the login page.
    `refresh()` drops the cached admin render so the back button cannot
    show the dashboard again from the router cache. */
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const logout = async () => {
    setPending(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* Even if the call failed, sending them to the login page is the
         right move: the proxy re-checks the cookie on the way in. */
    }

    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:border-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "جارٍ تسجيل الخروج…" : "تسجيل الخروج"}
    </button>
  );
}
