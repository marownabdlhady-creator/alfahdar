import { PrismaClient } from "@prisma/client";
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
}

main()
  .catch((error) => {
    console.error("✖ Seeding the admin user failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
