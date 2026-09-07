export type Service = {
  /** Stable slug; also the photo filename in /public/services. */
  slug: string;
  title: string;
  /** One line on what the category covers. */
  summary: string;
  /** Short examples, rendered as a single muted line. */
  examples: string[];
  image: string;
  alt: string;
};

/* Order matters: the first entry is the featured card. Photos in
   /public/services are temporary stand-ins — swapping a file keeps
   everything else untouched. */
export const SERVICES: Service[] = [
  {
    slug: "construction",
    title: "المقاولات والبناء",
    summary: "تنفيذ كامل من الأساس حتى التسليم، بإشراف هندسي وجدول واضح.",
    examples: ["مقاولات عامة", "بناء وترميم", "أعمال خرسانية", "عزل", "هدم"],
    image: "/services/construction.jpg",
    alt: "المقاولات والبناء - الفهدار",
  },
  {
    slug: "finishing",
    title: "التشطيبات",
    summary: "لمسات نهائية تُظهر قيمة المكان وتدوم طويلاً.",
    examples: ["دهانات", "سيراميك", "رخام", "جبس بورد", "ديكورات"],
    image: "/services/finishing.jpg",
    alt: "التشطيبات - الفهدار",
  },
  {
    slug: "technical",
    title: "الأعمال الفنية",
    summary: "تمديدات وأنظمة منفّذة على الأصول ومطابقة للمواصفات.",
    examples: ["كهرباء", "سباكة", "تكييف", "تمديدات"],
    image: "/services/technical.jpg",
    alt: "الأعمال الفنية - الفهدار",
  },
  {
    slug: "maintenance",
    title: "الصيانة",
    summary: "استجابة سريعة لأعطال المنزل وعقود صيانة دورية.",
    examples: ["مكيفات", "غسالات", "ثلاجات", "صيانة دورية", "إصلاح أعطال"],
    image: "/services/maintenance.jpg",
    alt: "الصيانة - الفهدار",
  },
  {
    slug: "supply",
    title: "التوريد والمواد",
    summary: "مواد ومستلزمات مختارة تصل إلى موقعك في وقتها.",
    examples: ["رخام", "حجر طبيعي", "سيراميك", "مواد بناء", "قطع غيار"],
    image: "/services/supply.jpg",
    alt: "التوريد والمواد - الفهدار",
  },
];
