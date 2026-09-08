import type { Prisma } from "@prisma/client";
import Link from "next/link";

import { ReviewActions } from "@/components/admin/review-actions";
import { ReviewStars } from "@/components/review-stars";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

/** Rows change from this very page; never serve a cached list. */
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

/** A repeated ?status= is a malformed URL, not an error worth a page for. */
const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

const TABS = [
  { key: "pending", label: "بانتظار المراجعة" },
  { key: "approved", label: "منشورة" },
  { key: "all", label: "الكل" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** Pending by default: what needs a decision comes first. Anything else
    in the URL falls back to it rather than 404ing. */
function readTab(params: SearchParams): TabKey {
  const status = first(params.status);
  return TABS.some((tab) => tab.key === status) ? (status as TabKey) : "pending";
}

const WHERE: Record<TabKey, Prisma.ReviewWhereInput> = {
  pending: { isApproved: false },
  approved: { isApproved: true },
  all: {},
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const tab = readTab(await searchParams);

  const [reviews, pending, approved] = await Promise.all([
    prisma.review.findMany({
      where: WHERE[tab],
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientName: true,
        serviceLabel: true,
        rating: true,
        comment: true,
        isApproved: true,
        createdAt: true,
      },
    }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.review.count({ where: { isApproved: true } }),
  ]);

  const counts: Record<TabKey, number> = {
    pending,
    approved,
    all: pending + approved,
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h2 className="text-step-1 font-semibold tracking-tight">التقييمات</h2>
      <p className="mt-1 text-step--1 text-muted">
        لا يظهر أي تقييم في الموقع قبل الموافقة عليه.
      </p>

      {/* A horizontal scroller on a phone, so the row never widens the page. */}
      <nav
        aria-label="تصفية التقييمات"
        className="mt-5 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((entry) => {
            const active = entry.key === tab;

            return (
              <li key={entry.key}>
                <Link
                  href={`/admin/reviews?status=${entry.key}`}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-step--1 font-medium whitespace-nowrap transition-colors duration-fast ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    active
                      ? "border-ink bg-ink text-ink-invert"
                      : "border-line bg-surface text-muted hover:border-ink/30 hover:text-ink",
                  ].join(" ")}
                >
                  {entry.label}
                  <span className="tabular-nums opacity-70">
                    {counts[entry.key]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {reviews.length === 0 ? (
        <p className="mt-5 rounded-xl border border-line bg-surface px-4 py-12 text-center text-step-0 text-muted">
          {tab === "pending"
            ? "لا توجد تقييمات بانتظار المراجعة."
            : "لا توجد تقييمات في هذا القسم."}
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-line bg-surface p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <ReviewStars rating={review.rating} />

                <span
                  className={[
                    "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-step--1 font-medium whitespace-nowrap",
                    review.isApproved
                      ? "border-status-done/25 bg-status-done/10 text-status-done"
                      : "border-status-new/25 bg-status-new/10 text-status-new",
                  ].join(" ")}
                >
                  {review.isApproved ? "منشور" : "بانتظار المراجعة"}
                </span>

                <span className="ms-auto text-step--1 text-muted">
                  {formatDateTime(review.createdAt)}
                </span>
              </div>

              <blockquote className="mt-4 text-step-0 break-words whitespace-pre-line">
                {review.comment}
              </blockquote>

              <p className="mt-4 text-step--1 font-semibold break-words">
                {review.clientName}
              </p>
              <p className="mt-0.5 text-step--1 text-muted">
                {review.serviceLabel}
              </p>

              <div className="mt-4 border-t border-line pt-4">
                <ReviewActions id={review.id} isApproved={review.isApproved} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
