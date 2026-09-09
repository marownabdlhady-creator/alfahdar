"use client";

import { useEffect, useId, useRef, useState } from "react";

import { ServiceSearch } from "@/components/service-search";

/* The header's search: one icon, always visible at every breakpoint, and
   a compact dropdown under it holding the same ServiceSearch the hero and
   /services use — no second copy of the matching logic.

   The panel is positioned against the header's inner container rather
   than against this button, because on a phone it drops full width and on
   a wide screen it has to stay under the header's end edge instead of the
   viewport's. That works because the root below is deliberately not
   positioned: the nearest positioned ancestor is the header container,
   which carries `relative` for exactly this. */

function MagnifierIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function HeaderSearch() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      /* A click on the icon itself is the toggle's business, not this. */
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="flex items-center"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;

        setOpen(false);
        buttonRef.current?.focus();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="بحث"
        aria-expanded={open}
        aria-controls={panelId}
        /* No colour of its own: it inherits the header's, so it stays
           legible over the dark hero and on the solid light bar alike. */
        className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-expanded:text-accent"
      >
        <MagnifierIcon />
      </button>

      {/* Kept mounted so it can fade both ways, and so `autoFocus` has a
          field to hand the caret to the moment it opens. `inert` takes it
          out of the tab order and off screen readers while it is shut. */}
      <div
        id={panelId}
        inert={!open}
        className={[
          /* Offsets run from the header container's padding box, so
             inset-x-0 lines the panel up with the logo and the nav. */
          "absolute inset-x-0 top-[calc(100%+0.5rem)] z-10 rounded-2xl border border-line bg-bg p-3 text-ink shadow-xl",
          "transition-[opacity,transform] duration-fast ease-out",
          "sm:inset-x-auto sm:end-0 sm:w-[24rem]",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        ].join(" ")}
      >
        <ServiceSearch
          variant="light"
          placeholder="ابحث عن خدمة..."
          autoFocus={open}
          onNavigate={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
