import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/* Creates (or refreshes) the first dashboard account from ADMIN_EMAIL and
   ADMIN_PASSWORD. Idempotent: re-running it re-hashes the same password
   rather than creating a second row. Nothing here ever logs the password
   or the hash. */

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const ADMIN_NAME = "مدير الفهدار";

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
}

main()
  .catch((error) => {
    console.error("✖ Seeding the admin user failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
