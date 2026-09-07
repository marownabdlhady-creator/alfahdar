/** The ServiceCategory enum values, mirroring prisma/schema.prisma. Kept as
    plain literals so client bundles never pull in @prisma/client. */
export const SERVICE_CATEGORIES = [
  "CONSTRUCTION",
  "FINISHING",
  "TECHNICAL",
  "MAINTENANCE",
  "SUPPLY",
] as const;

export type ServiceCategoryValue = (typeof SERVICE_CATEGORIES)[number];

/** The single source of truth for slug ↔ category. The front end speaks in
    slugs (routes, `?service=`, src/lib/services.ts); the database speaks in
    the enum. Everything that crosses that line goes through here. */
export const CATEGORY_BY_SLUG = {
  construction: "CONSTRUCTION",
  finishing: "FINISHING",
  technical: "TECHNICAL",
  maintenance: "MAINTENANCE",
  supply: "SUPPLY",
} as const satisfies Record<string, ServiceCategoryValue>;

export type ServiceSlug = keyof typeof CATEGORY_BY_SLUG;

/** null for anything that isn't one of the five slugs. */
export function categoryFromSlug(slug: string): ServiceCategoryValue | null {
  return slug in CATEGORY_BY_SLUG
    ? CATEGORY_BY_SLUG[slug as ServiceSlug]
    : null;
}
