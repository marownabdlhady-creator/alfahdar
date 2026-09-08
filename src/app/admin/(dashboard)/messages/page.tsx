import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Placeholder. The sidebar links here from this phase on; the inbox
    itself — the list, the statuses, the replies — lands next phase. The
    count is real so the page never lies about what is waiting. */
export default async function AdminMessagesPage() {
  const total = await prisma.contactMessage.count();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h2 className="text-step-1 font-semibold tracking-tight">رسائل التواصل</h2>

      <div className="mt-5 rounded-xl border border-line bg-surface p-6">
        <p className="text-step-0">
          عدد الرسائل المستلمة:{" "}
          <span className="font-semibold tabular-nums">{total}</span>
        </p>

        <p className="mt-3 text-step--1 text-muted">
          صفحة إدارة الرسائل قيد الإنشاء، وستتوفر في التحديث القادم.
        </p>

        <Link
          href="/admin/requests"
          className="mt-5 inline-flex items-center rounded-lg border border-line px-5 py-2.5 text-step--1 font-medium transition-colors duration-fast ease-out hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          الذهاب إلى طلبات الخدمة
        </Link>
      </div>
    </div>
  );
}
