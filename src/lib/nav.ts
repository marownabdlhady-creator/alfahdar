export type NavLink = {
  label: string;
  href: string;
};

export const NAV_LINKS: NavLink[] = [
  { label: "الرئيسية", href: "/" },
  { label: "من نحن", href: "/about" },
  { label: "خدماتنا", href: "/services" },
  { label: "أعمالنا", href: "/work" },
  { label: "لماذا الفهدار", href: "/#why" },
  { label: "تواصل معنا", href: "/contact" },
];

export const CTA = {
  label: "اطلب خدمة",
  href: "/request",
} as const;

export const BRAND = {
  name: "الفهدار",
  tagline: "كل ما يحتاجه دارك في مكان واحد",
  taglineLatin: "Construction · Finishing · Maintenance · Technical Services",
} as const;
