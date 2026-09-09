"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { searchServices } from "@/lib/service-search";

/* The instant service search, used twice: on the dark home hero and at
   the top of the light /services index. Everything it searches comes from
   src/lib/services.ts through src/lib/service-search.ts — this file only
   renders and handles the keyboard.

   The ARIA combobox pattern: focus never leaves the input, the highlighted
   row is announced through aria-activedescendant, and the rows are real
   links (so a middle-click or a long-press still works) held out of the
   tab order. Enter opens the highlighted service, Shift+Enter goes
   straight to the request form with it preselected.

   Every way out of the panel closes it: picking a row, Escape, a click
   outside, or focus leaving the widget — and a route change unmounts it. */

const DEBOUNCE_MS = 140;
const MAX_RESULTS = 7;

type Variant = "dark" | "light";

/* Both variants are built from the design tokens only. */
const STYLES: Record<
  Variant,
  {
    field: string;
    icon: string;
    clear: string;
    panel: string;
    option: string;
    optionActive: string;
    sub: string;
    action: string;
    divider: string;
    footer: string;
    empty: string;
    emptyLink: string;
    panelHeight: string;
  }
> = {
  dark: {
    field:
      "border-ink-invert/25 bg-bg-dark/55 text-ink-invert backdrop-blur-md placeholder:text-ink-invert/45 focus:border-accent",
    icon: "text-ink-invert/50",
    clear: "text-ink-invert/60 hover:text-ink-invert",
    panel:
      "border-ink-invert/15 bg-bg-dark/95 text-ink-invert shadow-2xl backdrop-blur-md",
    option: "hover:bg-ink-invert/10",
    optionActive: "bg-ink-invert/12",
    sub: "text-ink-invert/60",
    action:
      "border-ink-invert/30 text-ink-invert hover:border-accent hover:bg-accent hover:text-ink",
    divider: "border-ink-invert/10",
    footer: "text-ink-invert/45",
    empty: "text-ink-invert/70",
    emptyLink: "text-accent hover:text-ink-invert",
    panelHeight: "max-h-[min(50vh,22rem)]",
  },
  light: {
    field:
      "border-line bg-surface text-ink placeholder:text-muted/70 focus:border-accent",
    icon: "text-muted",
    clear: "text-muted hover:text-ink",
    panel: "border-line bg-surface text-ink shadow-xl",
    option: "hover:bg-bg",
    optionActive: "bg-bg",
    sub: "text-muted",
    action: "border-line text-ink hover:border-ink hover:bg-ink hover:text-ink-invert",
    divider: "border-line",
    footer: "text-muted",
    empty: "text-muted",
    emptyLink: "text-accent hover:text-ink",
    panelHeight: "max-h-[min(60vh,26rem)]",
  },
};

function SearchIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="h-4 w-4"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ServiceSearch({
  variant = "light",
  className = "",
  placeholder = "ابحث عن الخدمة التي تحتاجها...",
}: {
  variant?: Variant;
  className?: string;
  placeholder?: string;
}) {
  const styles = STYLES[variant];
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  /* What the results are actually computed from: `query` one beat later,
     so a fast typist scores the index once, not once per keystroke. */
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(query);
      /* The list is about to change under it, so the highlight goes back
         to the top of the new one. */
      setActive(0);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(
    () => searchServices(debounced, MAX_RESULTS),
    [debounced],
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const showPanel = open && debounced.trim().length > 0;
  const activeId =
    showPanel && results.length > 0 ? `${listId}-option-${active}` : undefined;

  const go = (index: number, toRequest: boolean) => {
    const result = results[index];
    if (!result) return;

    setOpen(false);
    router.push(toRequest ? result.requestHref : result.href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      /* First Escape closes the panel, a second one clears the field. */
      if (showPanel) setOpen(false);
      else setQuery("");
      return;
    }

    /* The list runs down the panel, so up/down carry it in RTL exactly as
       they do in LTR; left/right belong to the caret in the input. */
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (results.length === 0) return;
      event.preventDefault();
      setOpen(true);

      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(
        (current) => (current + step + results.length) % results.length,
      );
      return;
    }

    if (event.key === "Home" && showPanel) {
      event.preventDefault();
      setActive(0);
      return;
    }

    if (event.key === "End" && showPanel) {
      event.preventDefault();
      setActive(results.length - 1);
      return;
    }

    if (event.key === "Enter" && showPanel && results.length > 0) {
      event.preventDefault();
      go(active, event.shiftKey);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      /* Focus leaving the widget entirely closes it; moving between the
         input and a row inside it does not. */
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <div className="relative">
        <SearchIcon
          className={`pointer-events-none absolute top-1/2 start-4 h-5 w-5 -translate-y-1/2 ${styles.icon}`}
        />

        <input
          type="text"
          role="combobox"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="ابحث عن خدمة"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          /* text-step-0 never drops below 16px, so iOS won't zoom on focus. */
          className={`w-full min-w-0 rounded-full border py-4 pe-12 ps-11 text-step-0 transition-colors duration-fast ease-out focus:outline-2 focus:outline-offset-2 focus:outline-accent ${styles.field}`}
        />

        {query.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDebounced("");
            }}
            aria-label="مسح البحث"
            className={`absolute top-1/2 end-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-colors duration-fast ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${styles.clear}`}
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>

      {/* Announced quietly, so a screen reader hears the list change
          without the results being read out on every keystroke. */}
      <p aria-live="polite" className="sr-only">
        {showPanel
          ? results.length > 0
            ? `${results.length} نتيجة`
            : "لا توجد نتائج"
          : ""}
      </p>

      {showPanel ? (
        <div
          className={`absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border ${styles.panel}`}
        >
          {results.length > 0 ? (
            <>
              <ul
                id={listId}
                role="listbox"
                aria-label="نتائج البحث عن الخدمات"
                className={`overflow-y-auto overscroll-contain py-1.5 ${styles.panelHeight}`}
              >
                {results.map((result, index) => (
                  <li
                    key={result.id}
                    id={`${listId}-option-${index}`}
                    role="option"
                    aria-selected={index === active}
                    onMouseEnter={() => setActive(index)}
                    className={`relative flex items-center gap-3 px-3 transition-colors duration-fast ease-out ${styles.option} ${index === active ? styles.optionActive : ""}`}
                  >
                    {/* ::after stretches this link over the whole row, so
                        the row is one big tap target. */}
                    <Link
                      href={result.href}
                      tabIndex={-1}
                      onClick={() => setOpen(false)}
                      className="min-w-0 flex-1 py-3 after:absolute after:inset-0 after:content-['']"
                    >
                      <span className="block truncate text-step-0 font-medium">
                        {result.label}
                      </span>
                      <span
                        className={`block truncate text-step--1 ${styles.sub}`}
                      >
                        <span className="text-accent">
                          {result.isCategory ? "قسم" : result.categoryTitle}
                        </span>
                        {" · "}
                        {result.hint}
                      </span>
                    </Link>

                    <Link
                      href={result.requestHref}
                      tabIndex={-1}
                      onClick={() => setOpen(false)}
                      aria-label={`اطلب ${result.label}`}
                      className={`relative z-10 inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-step--1 font-medium transition-colors duration-fast ease-out ${styles.action}`}
                    >
                      اطلب
                    </Link>
                  </li>
                ))}
              </ul>

              <p
                className={`hidden items-center justify-center gap-3 border-t px-4 py-2 text-step--1 sm:flex ${styles.divider} ${styles.footer}`}
              >
                <span>↑↓ للتنقل</span>
                <span>Enter للتفاصيل</span>
                <span>Shift+Enter لطلب الخدمة</span>
              </p>
            </>
          ) : (
            /* Never a dead end: browse everything, or ask for it directly. */
            <div id={listId} className="px-5 py-5">
              <p className={`text-step--1 ${styles.empty}`}>
                لم نجد خدمة مطابقة لـ «{query.trim()}»
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-step--1 font-medium">
                <Link
                  href="/services"
                  onClick={() => setOpen(false)}
                  className={`transition-colors duration-fast ease-out ${styles.emptyLink}`}
                >
                  تصفّح كل خدماتنا
                </Link>
                <Link
                  href="/request"
                  onClick={() => setOpen(false)}
                  className={`transition-colors duration-fast ease-out ${styles.emptyLink}`}
                >
                  اطلب خدمة مخصصة
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
