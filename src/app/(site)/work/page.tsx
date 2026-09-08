import type { Metadata } from "next";

import { Reveal } from "@/components/reveal";
import { WorkGallery } from "@/components/work-gallery";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS_AR, SLUG_BY_CATEGORY } from "@/lib/service-category";
import type { WorkItem } from "@/lib/work";
import { workImageSize } from "@/lib/work-image";

export const metadata: Metadata = {
  title: "معرض أعمالنا | الفهدار",
  description:
    "معرض أعمال الفهدار: نماذج من مشاريعنا في التصميمات الهندسية، المقاولات والبناء، التشطيبات، الأعمال الفنية، الصيانة، توريد المواد والنظافة في السعودية.",
  keywords: [
    "أعمال الفهدار",
    "مشاريع مقاولات",
    "معرض تشطيبات",
    "أعمال بناء السعودية",
    "صيانة وخدمات فنية",
    "تصاميم هندسية",
  ],
  alternates: { canonical: "/work" },
};

/* The dashboard revalidates this path on every gallery mutation, so a new
   photo appears as soon as it is saved. The hourly figure is only a
   backstop for a revalidation that never arrived. */
export const revalidate = 3600;

/** The published gallery, in the shape the client component has always
    taken. Pixel sizes come from src/lib/work-image.ts; the alt text is
    built from the title and the category, the two things a row stores. */
async function getWorkItems(): Promise<WorkItem[]> {
  const rows = await prisma.workItem.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      imageUrl: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    src: row.imageUrl,
    ...workImageSize(row.imageUrl),
    title: row.title,
    alt: `الفهدار — ${row.title}، ${CATEGORY_LABELS_AR[row.category]}.`,
    category: SLUG_BY_CATEGORY[row.category],
  }));
}

export default async function WorkPage() {
  const items = await getWorkItems();

  return (
    /* No dark hero on this page, so it clears the fixed header itself. */
    <section aria-labelledby="work-title" className="bg-bg pt-28 pb-section lg:pt-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal className="min-w-0">
          <div className="flex items-center gap-4">
            <span aria-hidden className="h-0.5 w-10 shrink-0 bg-accent sm:w-14" />
            <span className="text-step--1 tracking-[0.14em] text-muted">
              أعمالنا
            </span>
          </div>

          <h1 id="work-title" className="mt-5 text-step-4 font-bold tracking-tight">
            معرض أعمالنا
          </h1>

          <p className="mt-4 max-w-[52ch] text-step-0 text-muted">
            نماذج من مشاريعنا في التصميمات الهندسية، المقاولات، التشطيبات،
            الصيانة، الخدمات الفنية والنظافة.
          </p>
        </Reveal>

        <div className="mt-9 min-w-0 lg:mt-12">
          <WorkGallery items={items} />
        </div>
      </div>
    </section>
  );
}
