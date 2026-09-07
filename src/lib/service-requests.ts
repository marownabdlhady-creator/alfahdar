import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/** Numbering starts at ALF-1001 so the first request never looks like a test. */
const BASE_SEQUENCE = 1000;

/** Two submissions landing in the same millisecond is the realistic case;
    a handful of retries covers far more than that. */
const MAX_ATTEMPTS = 8;

export function formatRequestNumber(sequence: number) {
  return `ALF-${sequence.toString().padStart(4, "0")}`;
}

function isRequestNumberCollision(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2002") return false;

  const target = error.meta?.target;
  return Array.isArray(target)
    ? target.includes("requestNumber")
    : typeof target === "string" && target.includes("requestNumber");
}

/** Everything the row needs except the number, which this function owns. */
type NewServiceRequest = Omit<
  Prisma.ServiceRequestUncheckedCreateInput,
  "id" | "requestNumber" | "status" | "createdAt" | "updatedAt"
>;

/** Creates the row and allocates its human-facing number.

    The count is only a starting guess: another insert can take the number
    between the count and our own insert, so a unique-constraint violation
    on `requestNumber` is expected rather than exceptional — we step to the
    next number and try again. Any other error is a real failure and is
    rethrown untouched.

    If this ever becomes hot, replace the count with a Postgres sequence;
    nothing outside this function knows how the number is derived. */
export async function createServiceRequest(data: NewServiceRequest) {
  const existing = await prisma.serviceRequest.count();
  let sequence = BASE_SEQUENCE + existing + 1;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await prisma.serviceRequest.create({
        data: { ...data, requestNumber: formatRequestNumber(sequence) },
        select: { id: true, requestNumber: true },
      });
    } catch (error) {
      if (!isRequestNumberCollision(error)) throw error;
      sequence += 1;
    }
  }

  throw new Error(
    `Could not allocate a request number after ${MAX_ATTEMPTS} attempts.`,
  );
}
