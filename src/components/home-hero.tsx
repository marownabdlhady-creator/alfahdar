"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useEffect, useState } from "react";

import { BRAND } from "@/lib/nav";

/* Files in /public. Order matters: the first one paints the hero. */
const SLIDES = [
  "/fahdar1.jpeg",
  "/fahdar2.jpg",
  "/fahdar3.jpg",
  "/fahdar4.jpeg",
] as const;

/** How long a slide is held before the next one starts fading in. */
const HOLD_MS = 5500;
/** Cross-fade length; it overlaps the front of the incoming slide's hold. */
const FADE_MS = 1600;

export function HomeHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;

    const sync = () => {
      window.clearInterval(timer);

      if (reduced.matches) {
        setIndex(0);
        return;
      }

      timer = window.setInterval(
        () => setIndex((current) => (current + 1) % SLIDES.length),
        HOLD_MS,
      );
    };

    sync();
    reduced.addEventListener("change", sync);

    return () => {
      window.clearInterval(timer);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-bg-dark text-ink-invert">
      {/* --- Cross-fading backdrop ------------------------------------ */}
      {SLIDES.map((src, i) => {
        const active = i === index;

        return (
          <div
            key={src}
            aria-hidden={!active}
            className="absolute inset-0 -z-10 ease-out"
            style={{
              opacity: active ? 1 : 0,
              transitionProperty: "opacity",
              transitionDuration: `${FADE_MS}ms`,
            }}
          >
            {/* No transform of any kind: the photo shows the full cover
                crop, nothing pushed further out of frame. */}
            <Image
              src={src}
              alt="من أعمال الفهدار"
              fill
              sizes="100vw"
              preload={i === 0}
              className="object-cover object-center"
            />
          </div>
        );
      })}

      {/* --- Overlay: a flat tint, a top/bottom gradient for the header
              and the headline, and a soft wash under the RTL text. ----- */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-bg-dark/35" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(13,13,13,0.55)_0%,rgba(13,13,13,0.15)_38%,rgba(13,13,13,0.35)_68%,rgba(13,13,13,0.85)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_left,rgba(13,13,13,0.45)_0%,rgba(13,13,13,0)_62%)]"
      />

      {/* --- Content: weighted to the lower third, RTL-aligned. -------- */}
      <div className="mx-auto w-full max-w-7xl px-6 pt-32 pb-[clamp(5rem,17vh,10rem)] lg:px-10">
        <h1
          className="hero-rise text-step-6 font-bold tracking-tight"
          style={{ "--hero-delay": "0.15s" } as CSSProperties}
        >
          {BRAND.name}
        </h1>

        <p
          className="hero-rise mt-5 max-w-[20ch] text-step-3 font-light tracking-tight text-balance"
          style={{ "--hero-delay": "0.35s" } as CSSProperties}
        >
          {BRAND.tagline}
        </p>

        <p
          className="hero-rise mt-6 max-w-[46ch] text-step-0 text-ink-invert/65"
          style={{ "--hero-delay": "0.55s" } as CSSProperties}
        >
          مقاولات، تشطيبات، صيانة وخدمات فنية باحترافية.
        </p>

        <div
          className="hero-rise mt-11 flex flex-wrap items-center gap-4"
          style={{ "--hero-delay": "0.75s" } as CSSProperties}
        >
          <Link
            href="/request"
            className="rounded-full bg-ink-invert px-8 py-4 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-9"
          >
            اطلب خدمة الآن
          </Link>

          <Link
            href="/services"
            className="rounded-full border border-ink-invert/40 px-8 py-4 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:border-ink-invert hover:bg-ink-invert/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-9"
          >
            تصفّح خدماتنا
          </Link>
        </div>
      </div>

      {/* --- Scroll hint ---------------------------------------------- */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 h-14 w-px -translate-x-1/2 overflow-hidden bg-ink-invert/15"
      >
        <div className="hero-hint h-full w-full bg-ink-invert/70" />
      </div>
    </section>
  );
}
