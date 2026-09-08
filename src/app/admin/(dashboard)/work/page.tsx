import { WorkManager } from "@/components/admin/work-manager";
import { prisma } from "@/lib/prisma";

/** The list changes from this very page; never cache it. */
export const dynamic = "force-dynamic";

/** Every gallery item, published or not, in the order the public page
    uses — so what the admin reorders here is what a visitor sees. */
export default async function AdminWorkPage() {
  const items = await prisma.workItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      imageUrl: true,
      order: true,
      isPublished: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <WorkManager items={items} />
    </div>
  );
}
