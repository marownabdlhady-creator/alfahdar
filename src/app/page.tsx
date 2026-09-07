import { HomeHero } from "@/components/home-hero";

export default function Home() {
  return (
    <>
      <HomeHero />

      {/* Temporary: gives the page something to scroll so the header's
          transparent → solid transition stays testable. Replaced by the
          real homepage sections in the next phase. */}
      <section className="flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
        <p className="text-step-2 text-muted">محتوى الصفحة الرئيسية</p>
      </section>
    </>
  );
}
