/** The shared top of every light home section: accent rule + kicker,
    title, supporting line. Keeps the rhythm identical across sections. */
export function SectionHeading({
  id,
  kicker,
  title,
  lead,
}: {
  /** Matches the section's aria-labelledby. */
  id: string;
  kicker: string;
  title: string;
  lead: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <span aria-hidden className="h-0.5 w-10 shrink-0 bg-accent sm:w-14" />
        <span className="text-step--1 tracking-[0.14em] text-muted">
          {kicker}
        </span>
      </div>

      <h2
        id={id}
        className="mt-6 max-w-[18ch] text-step-4 font-bold tracking-tight text-balance"
      >
        {title}
      </h2>

      <p className="mt-5 max-w-[52ch] text-step-0 text-muted">{lead}</p>
    </div>
  );
}
