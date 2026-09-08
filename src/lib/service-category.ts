/* Relative, not "@/lib/services": prisma/seed.ts imports this module
   through tsx, which does not resolve the tsconfig path alias. */
import { SERVICES } from "./services";

/** The ServiceCategory enum values, mirroring prisma/schema.prisma. Kept as
    plain literals so client bundles never pull in @prisma/client. */
export const SERVICE_CATEGORIES = [
  "CONSTRUCTION",
  "FINISHING",
  "TECHNICAL",
  "MAINTENANCE",
  "SUPPLY",
  "CLEANING",
  "ENGINEERING",
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
  cleaning: "CLEANING",
  engineering: "ENGINEERING",
} as const satisfies Record<string, ServiceCategoryValue>;

export type ServiceSlug = keyof typeof CATEGORY_BY_SLUG;

/** enum value → the Arabic category name, read straight from the service
    catalogue so the dashboard can never label a row differently from the
    public site. */
export const CATEGORY_LABELS_AR = Object.fromEntries(
  SERVICES.map((service) => [
    CATEGORY_BY_SLUG[service.slug as ServiceSlug],
    service.title,
  ]),
) as Record<ServiceCategoryValue, string>;

/** The inverse of CATEGORY_BY_SLUG, for everything that reads the enum out
    of the database and needs the front end's slug back — the work
    gallery's filters above all. */
export const SLUG_BY_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_BY_SLUG).map(([slug, category]) => [category, slug]),
) as Record<ServiceCategoryValue, ServiceSlug>;

/** null for anything that isn't a known service slug. */
export function categoryFromSlug(slug: string): ServiceCategoryValue | null {
  return slug in CATEGORY_BY_SLUG
    ? CATEGORY_BY_SLUG[slug as ServiceSlug]
    : null;
}
