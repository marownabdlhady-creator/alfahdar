"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { HeaderSearch } from "@/components/header-search";
import { BRAND, CTA, NAV_LINKS } from "@/lib/nav";

const SCROLL_THRESHOLD = 80;

/** The only route whose top is a dark hero the header can sit over.
    Everywhere else the page starts light, so the header must be solid
    from scroll position 0 or it disappears into the background. */
const DARK_HERO_ROUTES = new Set(["/"]);

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const hasDarkHero = DARK_HERO_ROUTES.has(pathname);
  const solid = !hasDarkHero || scrolled;

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-70 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2 focus:text-step--1 focus:font-medium focus:text-ink"
      >
        تخطي إلى المحتوى
      </a>

      {/* Transparent only while sitting over a dark hero; solid off-white
          once scrolled past it, and on every light-topped page from the
          start. */}
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 border-b",
          "transition-[background-color,color,border-color,box-shadow] duration-med ease-out",
          solid
            ? "border-line bg-bg text-ink shadow-[0_1px_24px_rgba(13,13,13,0.05)]"
            : "border-transparent bg-transparent text-ink-invert",
        ].join(" ")}
      >
        {/* relative: the search dropdown anchors to this container, so it
            spans the bar on a phone and stays under the header's end edge on
            a wide screen. */}
        <div className="relative mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-6 sm:gap-8 lg:h-24 lg:px-10">
          {/* The logo follows the header's two states: its own metallic
              artwork over the dark hero, an ink silhouette once the bar
              turns solid. The filter transitions with the bar's colours,
              so the swap isn't a jump. */}
          <Link
            href="/"
            aria-label={`${BRAND.name} — الصفحة الرئيسية`}
            className="shrink-0 transition-opacity duration-fast ease-out hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent"
          >
            <BrandLogo
              eager
              backdrop={solid ? "light" : "dark"}
              className="h-9 transition-[filter] duration-med ease-out lg:h-11"
            />
          </Link>

          <nav aria-label="التنقل الرئيسي" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "relative inline-block py-2 text-step--1 tracking-tight",
                        "transition-colors duration-fast ease-out hover:text-accent",
                        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                        "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:bg-accent",
                        "after:transition-transform after:duration-fast after:ease-out",
                        active
                          ? "text-accent after:scale-x-100"
                          : "after:scale-x-0 hover:after:scale-x-100",
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-4">
            <Link
              href={CTA.href}
              className="hidden rounded-full bg-accent px-7 py-3 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:inline-block"
            >
              {CTA.label}
            </Link>

            {/* Always in the top bar — never folded into the drawer. */}
            <HeaderSearch />

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="-me-2 inline-flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
            >
              <span aria-hidden className="flex w-6 flex-col items-end gap-[6px]">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-2/3 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل"
        inert={!menuOpen}
        className={[
          "fixed inset-0 z-60 bg-bg-dark text-ink-invert lg:hidden",
          "transition-opacity duration-med ease-out",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="mx-auto flex h-20 w-full max-w-7xl shrink-0 items-center justify-between px-6">
            {/* The drawer is bg-bg-dark, so the artwork shows as drawn. */}
            <BrandLogo backdrop="dark" className="h-9" />
            <button
              ref={closeRef}
              type="button"
              onClick={closeMenu}
              aria-label="إغلاق القائمة"
              className="-me-2 inline-flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span aria-hidden className="relative block h-6 w-6">
                <span className="absolute inset-x-0 top-1/2 h-px rotate-45 bg-current" />
                <span className="absolute inset-x-0 top-1/2 h-px -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <nav
            aria-label="التنقل في الجوال"
            className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center overflow-y-auto px-6 pb-16"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((link, index) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    style={{
                      transitionDelay: menuOpen ? `${80 + index * 60}ms` : "0ms",
                    }}
                    className={[
                      "block border-b border-ink-invert/10 py-5 text-step-2 tracking-tight",
                      "transition-[opacity,transform,color] duration-med ease-out",
                      "hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                      menuOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-3 opacity-0",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={CTA.href}
              onClick={closeMenu}
              style={{
                transitionDelay: menuOpen
                  ? `${80 + NAV_LINKS.length * 60}ms`
                  : "0ms",
              }}
              className={[
                "mt-12 inline-block self-start rounded-full bg-accent px-9 py-4 text-step-0 font-medium text-ink",
                "transition-[opacity,transform,background-color] duration-med ease-out",
                "hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              ].join(" ")}
            >
              {CTA.label}
            </Link>

            <p className="mt-12 text-step--1 text-ink-invert/50">
              {BRAND.tagline}
            </p>
          </nav>
        </div>
      </div>
    </>
  );
}
