"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { LogoutButton } from "@/components/admin/logout-button";
import { ADMIN_NAV, adminSectionTitle, isActiveAdminLink } from "@/lib/admin-nav";
import { BRAND } from "@/lib/nav";

/* The dashboard chrome. Utilitarian on purpose — this is an internal
   tool, so clarity beats decoration. RTL puts the sidebar on the right
   without any positioning: it is simply the first child of the row.

   Client-side for three reasons only: the active-link highlight, the
   mobile drawer, and the section title. Every page inside stays a server
   component; they arrive here as `children`. */

const NAV_LINK_BASE =
  "block rounded-lg px-4 py-3 text-step--1 font-medium transition-colors duration-fast ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="h-5 w-5"
    >
      {open ? (
        <>
          <path d="m6 6 12 12" />
          <path d="m18 6-12 12" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-6 py-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="text-step-1 font-semibold tracking-tight transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {BRAND.name}
        </Link>
        <p className="mt-1 text-step--1 text-muted">لوحة التحكم</p>
      </div>

      <nav aria-label="أقسام لوحة التحكم" className="flex-1 px-3 py-5">
        <ul className="flex flex-col gap-1">
          {ADMIN_NAV.map((link) => {
            const active = isActiveAdminLink(link, pathname);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={[
                    NAV_LINK_BASE,
                    active
                      ? "border-e-2 border-accent bg-accent/10 text-ink"
                      : "text-muted hover:bg-bg hover:text-ink",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* flex-col stretches the button to the sidebar width. */}
      <div className="flex flex-col border-t border-line px-4 py-5">
        <LogoutButton />
      </div>
    </div>
  );
}

export function AdminShell({
  adminLabel,
  children,
}: {
  adminLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  /* The drawer must never stay open over the page it just opened. Nav
     links close it on tap for an instant response; this catches every
     other route change — the back button above all — by resetting during
     render rather than in an effect, so there is no extra pass. */
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
  }

  useEffect(() => {
    if (!drawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar. `border-s` is the inner edge in RTL. */}
      <aside className="hidden w-64 shrink-0 border-s border-line bg-surface lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      {/* Mobile drawer. Rendered only while open so nothing off-screen can
          be tabbed into. */}
      {drawerOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-ink/40"
          />
          <div className="fixed inset-y-0 start-0 z-50 w-72 max-w-[85vw] border-s border-line bg-surface shadow-[0_0_40px_rgba(13,13,13,0.12)]">
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-label="فتح القائمة"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-ink transition-colors duration-fast ease-out hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
            >
              <MenuIcon open={drawerOpen} />
            </button>

            <h1 className="min-w-0 flex-1 truncate text-step-0 font-semibold tracking-tight">
              {adminSectionTitle(pathname)}
            </h1>

            <span className="min-w-0 max-w-[45%] truncate text-step--1 text-muted">
              {adminLabel}
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
