import { PrismaClient } from "@prisma/client";

/* One client for the whole app. In dev, hot reload re-evaluates modules on
   every edit, so without the global a new pool would be opened each time
   until the database refuses connections. Production gets a fresh module
   graph per instance, so it holds no global. */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
