export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-section text-center">
      <h1 className="text-step-5 font-semibold tracking-tight text-ink">
        الفهدار
      </h1>
      <span
        aria-hidden
        className="mt-6 block h-px w-16 bg-accent"
      />
      <p className="mt-6 text-step-1 text-muted">
        كل ما يحتاجه دارك في مكان واحد
      </p>
    </main>
  );
}
