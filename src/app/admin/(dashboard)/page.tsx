import Link from "next/link";

import { StatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/prisma";
import {
  REQUEST_STATUSES,
  type RequestStatusValue,
} from "@/lib/request-status";

/** Counts change with every submission, so nothing here may be cached. */
export const dynamic = "force-dynamic";

/** Every status starts at zero: groupBy only returns the ones present, and
    a card that disappears when its count drops to zero reads as a bug. */
function emptyCounts(): Record<RequestStatusValue, number> {
  return Object.fromEntries(
    REQUEST_STATUSES.map((status) => [status, 0]),
  ) as Record<RequestStatusValue, number>;
}

function StatCard({
  label,
  value,
  href,
  emphasis = false,
  hint,
}: {
  label: string;
  value: number;
  href: string;
  emphasis?: boolean;
  /** A second line under the number, for a breakdown worth one glance. */
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "group flex flex-col justify-between rounded-xl border bg-surface p-5 transition-colors duration-fast ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        emphasis ? "border-accent/40" : "border-line hover:border-ink/20",
      ].join(" ")}
    >
      <span className="text-step--1 text-muted">{label}</span>
      <span className="mt-3 text-step-3 font-bold tracking-tight tabular-nums">
        {value}
      </span>
      {hint && <span className="mt-1 text-step--1 text-muted">{hint}</span>}
    </Link>
  );
}

export default async function AdminOverviewPage() {
  const [
    requestsTotal,
    byStatus,
    messagesTotal,
    newMessages,
    pendingReviews,
    recent,
  ] = await Promise.all([
      prisma.serviceRequest.count(),
      prisma.serviceRequest.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.serviceRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          requestNumber: true,
          fullName: true,
          city: true,
          status: true,
        },
      }),
    ]);

  const counts = emptyCounts();
  for (const row of byStatus) counts[row.status] = row._count._all;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <section aria-labelledby="overview-totals">
        <h2 id="overview-totals" className="text-step-1 font-semibold tracking-tight">
          نظرة عامة
        </h2>
        <p className="mt-1 text-step--1 text-muted">
          أرقام مباشرة من قاعدة البيانات.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <StatCard
            label="إجمالي الطلبات"
            value={requestsTotal}
            href="/admin/requests"
            emphasis
          />
          <StatCard
            label="طلبات جديدة"
            value={counts.NEW}
            href="/admin/requests?status=NEW"
          />
          <StatCard
            label="جاري التنفيذ"
            value={counts.IN_PROGRESS}
            href="/admin/requests?status=IN_PROGRESS"
          />
          <StatCard
            label="رسائل التواصل"
            value={messagesTotal}
            href={newMessages > 0 ? "/admin/messages?status=NEW" : "/admin/messages"}
            hint={newMessages > 0 ? `منها ${newMessages} جديدة` : undefined}
          />
          <StatCard
            label="تقييمات بانتظار المراجعة"
            value={pendingReviews}
            href="/admin/reviews?status=pending"
          />
        </div>
      </section>

      <section aria-labelledby="overview-status" className="mt-10">
        <h2 id="overview-status" className="text-step-1 font-semibold tracking-tight">
          الطلبات حسب الحالة
        </h2>

        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REQUEST_STATUSES.map((status) => (
            <li key={status}>
              <Link
                href={`/admin/requests?status=${status}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 transition-colors duration-fast ease-out hover:border-ink/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <StatusBadge status={status} />
                <span className="text-step-0 font-semibold tabular-nums">
                  {counts[status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="overview-recent" className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="overview-recent"
            className="text-step-1 font-semibold tracking-tight"
          >
            أحدث الطلبات
          </h2>
          <Link
            href="/admin/requests"
            className="text-step--1 font-medium text-muted transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            عرض كل الطلبات
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-5 rounded-xl border border-line bg-surface px-4 py-8 text-center text-step--1 text-muted">
            لا توجد طلبات بعد.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {recent.map((request) => (
              <li key={request.id}>
                <Link
                  href={`/admin/requests/${request.id}`}
                  className="flex min-w-0 items-center justify-between gap-3 px-4 py-3.5 transition-colors duration-fast ease-out hover:bg-bg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-step--1 font-semibold">
                      {request.fullName}
                    </span>
                    <span className="mt-0.5 block truncate text-step--1 text-muted">
                      {request.requestNumber} · {request.city}
                    </span>
                  </span>
                  <StatusBadge status={request.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
