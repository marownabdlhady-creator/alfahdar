export default function Home() {
  return (
    <>
      {/* Temporary scaffolding: verifies the transparent header over a dark
          hero area. Replaced by the real hero in the next phase. */}
      <section className="flex min-h-[100svh] items-center justify-center bg-bg-dark px-6 text-ink-invert">
        <h1 className="text-step-3 tracking-tight">قريباً — الصفحة الرئيسية</h1>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
        <p className="text-step-2 text-muted">محتوى</p>
      </section>
    </>
  );
}
