import { PrismaClient, ServiceCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

/* Relative imports, not the "@/" alias: tsx runs this file without the
   tsconfig path mapping. */
import { CATEGORY_BY_SLUG, type ServiceSlug } from "../src/lib/service-category";
import { WORK_ITEMS } from "../src/lib/work";

/* Creates (or refreshes) the first dashboard account from ADMIN_EMAIL and
   ADMIN_PASSWORD, and fills an empty gallery with the photos the site
   shipped with. Idempotent: re-running it re-hashes the same password
   rather than creating a second row, and leaves a non-empty gallery
   alone. Nothing here ever logs the password or the hash. */

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const ADMIN_NAME = "مدير الفهدار";

/** Moves the gallery that used to live in src/lib/work.ts into the table
    the dashboard now manages. Only ever runs against an empty table: once
    an admin has added or deleted anything, re-seeding would fight them.

    The /public paths carry over unchanged — next/image serves those and
    Blob URLs alike — and `order` follows the hand-mixed array order, so
    the page looks exactly as it did before the switch. */
async function seedWorkItems() {
  const existing = await prisma.workItem.count();

  if (existing > 0) {
    console.log(`• Gallery already has ${existing} item(s); left untouched.`);
    return;
  }

  const created = await prisma.workItem.createMany({
    data: WORK_ITEMS.map((item, index) => ({
      title: item.title,
      category: CATEGORY_BY_SLUG[item.category as ServiceSlug],
      imageUrl: item.src,
      order: index,
      isPublished: true,
    })),
  });

  console.log(`✔ Seeded ${created.count} gallery item(s).`);
}

/* The photos the owner dropped into /public after the gallery moved into
   the database. Unlike seedWorkItems() above, this one runs against a
   gallery the dashboard is already managing, so it adds only what is
   missing and never touches an existing row.

   The five contracting photos are listed twice on purpose — the owner
   wants them under التشطيبات as well as المقاولات — which is why the
   "already there?" check is keyed on imageUrl *and* category: the same
   file may appear once per category, but never twice within one. */
const NEW_WORK_ITEMS: {
  title: string;
  category: ServiceCategory;
  imageUrl: string;
}[] = [
  { title: "مشروع مقاولات", category: ServiceCategory.CONSTRUCTION, imageUrl: "/Contracting3.jpeg" },
  { title: "أعمال بناء", category: ServiceCategory.CONSTRUCTION, imageUrl: "/Contracting4.jpeg" },
  { title: "بناء وتشييد", category: ServiceCategory.CONSTRUCTION, imageUrl: "/Contracting5.jpeg" },
  { title: "مشروع إنشائي", category: ServiceCategory.CONSTRUCTION, imageUrl: "/Contracting6.jpeg" },
  { title: "أعمال مقاولات عامة", category: ServiceCategory.CONSTRUCTION, imageUrl: "/Contracting7.jpeg" },

  { title: "أعمال تشطيب", category: ServiceCategory.FINISHING, imageUrl: "/Contracting3.jpeg" },
  { title: "تشطيب داخلي", category: ServiceCategory.FINISHING, imageUrl: "/Contracting4.jpeg" },
  { title: "تشطيبات متكاملة", category: ServiceCategory.FINISHING, imageUrl: "/Contracting5.jpeg" },
  { title: "أعمال دهانات وتشطيب", category: ServiceCategory.FINISHING, imageUrl: "/Contracting6.jpeg" },
  { title: "تشطيب فاخر", category: ServiceCategory.FINISHING, imageUrl: "/Contracting7.jpeg" },

  { title: "توريد رخام", category: ServiceCategory.SUPPLY, imageUrl: "/Supply1.jpeg" },
  { title: "توريد مواد بناء", category: ServiceCategory.SUPPLY, imageUrl: "/Supply2.jpeg" },
  { title: "توريد حجر طبيعي", category: ServiceCategory.SUPPLY, imageUrl: "/Supply3.jpeg" },
  { title: "توريد سيراميك", category: ServiceCategory.SUPPLY, imageUrl: "/Suppl4.jpeg" },
  { title: "مستلزمات تشطيب", category: ServiceCategory.SUPPLY, imageUrl: "/Supply5.jpeg" },
];

/** Appends NEW_WORK_ITEMS to the gallery, skipping any (imageUrl,
    category) pair that is already there. New rows continue after the
    highest `order` in the table, so they land at the end of /work
    without disturbing the order an admin has arranged. */
async function seedNewWorkItems() {
  const urls = [...new Set(NEW_WORK_ITEMS.map((item) => item.imageUrl))];

  const present = new Set(
    (
      await prisma.workItem.findMany({
        where: { imageUrl: { in: urls } },
        select: { imageUrl: true, category: true },
      })
    ).map((row) => `${row.imageUrl}|${row.category}`),
  );

  const missing = NEW_WORK_ITEMS.filter(
    (item) => !present.has(`${item.imageUrl}|${item.category}`),
  );

  if (missing.length === 0) {
    console.log("• No new gallery photos to add; all of them are already in.");
    return;
  }

  const highest = await prisma.workItem.aggregate({ _max: { order: true } });
  const nextOrder = (highest._max.order ?? -1) + 1;

  const created = await prisma.workItem.createMany({
    data: missing.map((item, index) => ({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      order: nextOrder + index,
      isPublished: true,
    })),
  });

  console.log(`✔ Added ${created.count} new gallery item(s).`);
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding the admin.",
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    /* On re-run the hash is refreshed, so changing ADMIN_PASSWORD in .env
       and re-seeding is how the password gets rotated for now. */
    update: { passwordHash },
    create: { email, passwordHash, name: ADMIN_NAME },
    select: { id: true },
  });

  console.log(`✔ Admin user ready (id: ${admin.id}).`);

  await seedWorkItems();
  await seedNewWorkItems();
}

main()
  .catch((error) => {
    console.error("✖ Seeding the admin user failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
