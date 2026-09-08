export const TOTAL_STARS = 5;

/** The one star outline the site draws — the read-only display below and
    the rating input in the review form both render it. */
export function StarIcon({
  filled,
  className = "h-4 w-4",
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`${className} ${filled ? "text-accent" : "text-line"}`}
    >
      <path d="M10 1.6 12.4 6.7l5.6.8-4.1 3.9 1 5.5-4.9-2.6-4.9 2.6 1-5.5L2 7.5l5.6-.8L10 1.6Z" />
    </svg>
  );
}

/** A rating, read-only. One image to a screen reader, not five. */
export function ReviewStars({
  rating,
  className = "h-4 w-4",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`التقييم ${rating} من ${TOTAL_STARS}`}
      className="flex items-center gap-1"
    >
      {Array.from({ length: TOTAL_STARS }, (_, index) => (
        <StarIcon key={index} filled={index < rating} className={className} />
      ))}
    </div>
  );
}
