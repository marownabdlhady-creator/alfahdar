import { SERVICES } from "./services";

export type WorkItem = {
  /** Stable id; becomes the database row id later. */
  id: string;
  src: string;
  /** Intrinsic pixel size. Feeds next/image so the masonry reserves the
      right box before the file arrives and nothing shifts. */
  width: number;
  height: number;
  /** Descriptive Arabic alt text. */
  alt: string;
  /** Short Arabic project title, shown on the tile and in the lightbox. */
  title: string;
  /** One of the service slugs in src/lib/services.ts. */
  category: string;
};

/** slug → Arabic label, taken straight from the service catalogue so the
    gallery can never drift from the rest of the site. */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  SERVICES.map((service) => [service.slug, service.title]),
);

/** The filter bar: "الكل" followed by every category, in site order. */
export const WORK_FILTERS = [
  { slug: "all", label: "الكل" },
  ...SERVICES.map((service) => ({ slug: service.slug, label: service.title })),
];

/* The gallery the site shipped with. /work no longer reads this — it
   reads the WorkItem table the dashboard manages — but the array is not
   dead: prisma/seed.ts turns it into the first rows of an empty gallery,
   and src/lib/work-image.ts reads the pixel sizes back out of it for the
   /public photos those rows point at.

   Order is hand-mixed: categories and portrait/landscape ratios alternate,
   so the unfiltered masonry reads well in every column count. `order` on
   the seeded rows follows this array, which is what preserves it. */
export const WORK_ITEMS: WorkItem[] = [
  {
    id: "w-01",
    src: "/fahdar1.jpeg",
    width: 1200,
    height: 1600,
    title: "بناء هيكل خرساني",
    alt: "الفهدار — تنفيذ هيكل خرساني لمشروع سكني قيد الإنشاء.",
    category: "construction",
  },
  {
    id: "w-02",
    src: "/fahdar3.jpg",
    width: 1365,
    height: 768,
    title: "تشطيب صالة معيشة",
    alt: "الفهدار — تشطيب داخلي لصالة معيشة بإنهاءات نهائية وإضاءة مدروسة.",
    category: "finishing",
  },
  {
    id: "w-11",
    src: "/engineering-3.jpg",
    width: 1200,
    height: 1600,
    title: "تصميم معماري لفيلا",
    alt: "الفهدار — تصميم معماري ثلاثي الأبعاد لفيلا سكنية بواجهة عصرية.",
    category: "engineering",
  },
  {
    id: "w-03",
    src: "/fahdar6.jpeg",
    width: 1280,
    height: 720,
    title: "تمديدات كهربائية",
    alt: "الفهدار — أعمال فنية تشمل تمديدات كهربائية وتركيب لوحة توزيع.",
    category: "technical",
  },
  {
    id: "w-04",
    src: "/fahdar8.jpeg",
    width: 720,
    height: 1280,
    title: "تركيب أرضيات رخام",
    alt: "الفهدار — تركيب أرضيات رخام في مدخل فيلا سكنية.",
    category: "finishing",
  },
  {
    id: "w-12",
    src: "/engineering-4.jpg",
    width: 1600,
    height: 1151,
    title: "مخطط معماري",
    alt: "الفهدار — مخطط معماري تفصيلي لتوزيع مساحات مشروع سكني.",
    category: "engineering",
  },
  {
    id: "w-05",
    src: "/fahdar10.jpeg",
    width: 1280,
    height: 720,
    title: "تشييد مبنى سكني",
    alt: "الفهدار — أعمال مقاولات وتشييد لمبنى سكني من الخارج.",
    category: "construction",
  },
  {
    id: "w-06",
    src: "/fahdar7.jpeg",
    width: 1280,
    height: 720,
    title: "صيانة وحدة تكييف",
    alt: "الفهدار — أعمال صيانة دورية وفحص لوحدة تكييف.",
    category: "maintenance",
  },
  {
    id: "w-13",
    src: "/engineering-2.jpg",
    width: 720,
    height: 1280,
    title: "تصميم واجهة",
    alt: "الفهدار — تصميم واجهة خارجية لمبنى بمواد وتشطيبات مختارة.",
    category: "engineering",
  },
  {
    id: "w-07",
    src: "/fahdar2.jpg",
    width: 896,
    height: 1195,
    title: "تشطيب فيلا سكنية",
    alt: "الفهدار — تشطيب واجهة ومدخل فيلا سكنية بمواد عالية الجودة.",
    category: "finishing",
  },
  {
    id: "w-08",
    src: "/fahdar9.jpeg",
    width: 1280,
    height: 720,
    title: "توريد مواد بناء",
    alt: "الفهدار — توريد مواد بناء ومستلزمات التنفيذ إلى موقع المشروع.",
    category: "supply",
  },
  {
    id: "w-14",
    src: "/engineering-5.jpg",
    width: 1200,
    height: 1600,
    title: "تصميم داخلي",
    alt: "الفهدار — تصميم داخلي لمساحة معيشة بتوزيع أثاث وإضاءة مدروسة.",
    category: "engineering",
  },
  {
    id: "w-09",
    src: "/fahdar5.jpeg",
    width: 720,
    height: 1280,
    title: "بناء سور وواجهة",
    alt: "الفهدار — أعمال بناء سور خارجي وواجهة لمشروع سكني.",
    category: "construction",
  },
  {
    id: "w-10",
    src: "/services/cleaning.jpg",
    width: 1600,
    height: 1067,
    title: "تنظيف وتعقيم شامل",
    alt: "الفهدار — أعمال تنظيف وتعقيم شامل لمرافق سكنية.",
    category: "cleaning",
  },
  {
    id: "w-15",
    src: "/engineering-6.jpg",
    width: 960,
    height: 1280,
    title: "مخطط إنشائي",
    alt: "الفهدار — مخطط إنشائي يوضح تفاصيل الأعمدة والأساسات للمشروع.",
    category: "engineering",
  },
];
