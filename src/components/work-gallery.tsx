"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Reveal } from "@/components/reveal";
import { CATEGORY_LABELS, WORK_FILTERS, type WorkItem } from "@/lib/work";

/* How long the outgoing items fade for before the new set mounts. Short
   enough to feel immediate, long enough not to read as a cut. */
const SWAP_MS = 200;

/* The tile is at most half the screen on phones, a third on laptops and a
   quarter on wide screens — so a phone never downloads a desktop-sized file. */
const TILE_SIZES =
  "(min-width: 1280px) 23vw, (min-width: 1024px) 31vw, (min-width: 640px) 45vw, 46vw";

/* --- Icons -------------------------------------------------------- */

function Stroke({
  children,
  className = "h-5 w-5",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function CloseIcon() {
  return (
    <Stroke className="h-5 w-5">
      <path d="m6 6 12 12M18 6 6 18" />
    </Stroke>
  );
}

/* Points toward the start edge — the right, in RTL. */
function ChevronStartIcon() {
  return (
    <Stroke className="h-5 w-5">
      <path d="m9 6 6 6-6 6" />
    </Stroke>
  );
}

/* Points toward the end edge — the left, in RTL. */
function ChevronEndIcon() {
  return (
    <Stroke className="h-5 w-5">
      <path d="m15 6-6 6 6 6" />
    </Stroke>
  );
}

/* --- Helpers ------------------------------------------------------- */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FOCUSABLE = "button, [href], input, select, textarea, [tabindex]";

/* --- The gallery ---------------------------------------------------- */

export function WorkGallery({ items }: { items: WorkItem[] }) {
  /* `active` drives the chips and updates on click; `visible` drives the
     grid and lags by one fade, so the outgoing set never cuts out. */
  const [active, setActive] = useState("all");
  const [visible, setVisible] = useState("all");
  const [swapping, setSwapping] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (swapTimer.current) clearTimeout(swapTimer.current);
    },
    [],
  );

  const shown = useMemo(
    () =>
      visible === "all"
        ? items
        : items.filter((item) => item.category === visible),
    [items, visible],
  );

  const pickFilter = (slug: string) => {
    if (slug === active) return;
    setActive(slug);
    setOpenIndex(null);

    if (swapTimer.current) clearTimeout(swapTimer.current);
    if (prefersReducedMotion()) {
      setVisible(slug);
      return;
    }

    setSwapping(true);
    swapTimer.current = setTimeout(() => {
      setVisible(slug);
      setSwapping(false);
    }, SWAP_MS);
  };

  /* --- Lightbox ---------------------------------------------------- */

  const open = openIndex !== null;
  /* One object, so the index is narrowed alongside the item it points at. */
  const lightbox =
    openIndex !== null && shown[openIndex]
      ? { index: openIndex, item: shown[openIndex] }
      : null;

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const openAt = (index: number) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setOpenIndex(index);
  };

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (direction: 1 | -1) => {
      setOpenIndex((index) => {
        if (index === null || shown.length === 0) return index;
        return (index + direction + shown.length) % shown.length;
      });
    },
    [shown.length],
  );

  useEffect(() => {
    if (!open) return;

    const opener = openerRef.current;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      /* RTL: the left arrow moves forward, the right arrow moves back. */
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key !== "Tab") return;

      const node = dialogRef.current;
      if (!node) return;
      const targets = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (targets.length === 0) return;

      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [open, close, step]);

  const onTouchStart = (event: React.TouchEvent) => {
    const point = event.changedTouches[0];
    touchStart.current = { x: point.clientX, y: point.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const point = event.changedTouches[0];
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
    /* Dragging the image leftwards pulls the next one in, as in RTL reading. */
    step(dx < 0 ? 1 : -1);
  };

  /* --- Render ------------------------------------------------------- */

  return (
    <>
      {/* The chip row scrolls inside itself and bleeds to the gutter edge,
          so a long list never widens the page. */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 [&::-webkit-scrollbar]:hidden">
        <ul
          aria-label="تصفية الأعمال حسب القسم"
          className="flex w-max gap-2 sm:gap-2.5"
        >
          {WORK_FILTERS.map((filter) => {
            const selected = filter.slug === active;
            return (
              <li key={filter.slug}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => pickFilter(filter.slug)}
                  className={[
                    "rounded-full border px-4 py-2.5 text-step--1 font-medium whitespace-nowrap",
                    "transition-colors duration-fast ease-out",
                    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                    selected
                      ? "border-accent bg-accent text-ink"
                      : "border-line bg-surface text-ink hover:border-ink",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-step-0 text-muted">
          لا توجد أعمال في هذا القسم حالياً.
        </p>
      ) : (
        /* CSS multicol: cheap, reflow-free masonry. `break-inside-avoid`
           keeps a tile whole, and the browser fills columns right-to-left
           on its own under dir="rtl". */
        <ul
          key={visible}
          className={[
            "mt-8 columns-2 gap-3 sm:gap-4 lg:columns-3 xl:columns-4",
            "transition-opacity duration-fast ease-out",
            swapping ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          {shown.map((item, index) => (
            <li key={item.id} className="mb-3 break-inside-avoid sm:mb-4">
              <Reveal delay={Math.min(index, 6) * 60}>
                <button
                  type="button"
                  onClick={() => openAt(index)}
                  aria-haspopup="dialog"
                  aria-label={`عرض ${item.title} — ${CATEGORY_LABELS[item.category]}`}
                  className="group relative block w-full overflow-hidden rounded-xl border border-line bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes={TILE_SIZES}
                    loading={index < 4 ? "eager" : "lazy"}
                    className="block h-auto w-full transition-transform duration-med ease-out lg:group-hover:scale-[1.04]"
                  />

                  {/* Always legible on touch; on desktop it settles in on
                      hover or keyboard focus. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(13,13,13,0.88)_0%,rgba(13,13,13,0.45)_45%,rgba(13,13,13,0)_100%)] p-3 text-start transition-opacity duration-med ease-out sm:p-4 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
                  >
                    <span className="block text-step--1 font-medium text-ink-invert">
                      {item.title}
                    </span>
                    <span className="mt-0.5 hidden text-step--1 text-ink-invert/70 sm:block">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </span>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>
      )}

      {lightbox && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`معرض الأعمال — ${lightbox.item.title}`}
          onClick={close}
          className="fixed inset-0 z-70 flex flex-col bg-bg-dark/95 text-ink-invert"
        >
          <div className="flex shrink-0 justify-end px-4 pt-4 sm:px-6">
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="إغلاق المعرض"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink-invert/25 transition-colors duration-fast ease-out hover:border-ink-invert focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-4 pb-6 sm:px-6">
            <figure
              onClick={(event) => event.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              className="flex min-h-0 w-full min-w-0 flex-col items-center"
            >
              <Image
                src={lightbox.item.src}
                alt={lightbox.item.alt}
                width={lightbox.item.width}
                height={lightbox.item.height}
                sizes="(min-width: 1024px) 70vw, 92vw"
                className="max-h-[58dvh] w-auto max-w-full rounded-lg object-contain sm:max-h-[66dvh]"
              />
              <figcaption className="mt-4 text-center">
                <span className="block text-step-0 font-medium">
                  {lightbox.item.title}
                </span>
                <span className="mt-1 block text-step--1 text-ink-invert/60">
                  {CATEGORY_LABELS[lightbox.item.category]}
                </span>
              </figcaption>
            </figure>

            <div
              onClick={(event) => event.stopPropagation()}
              className="flex shrink-0 items-center gap-4"
            >
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="العمل السابق"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink-invert/25 transition-colors duration-fast ease-out hover:border-ink-invert focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <ChevronStartIcon />
              </button>

              <span
                dir="ltr"
                aria-hidden
                className="font-inter text-step--1 tracking-[0.14em] text-ink-invert/50"
              >
                {lightbox.index + 1} / {shown.length}
              </span>

              <button
                type="button"
                onClick={() => step(1)}
                aria-label="العمل التالي"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink-invert/25 transition-colors duration-fast ease-out hover:border-ink-invert focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <ChevronEndIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
