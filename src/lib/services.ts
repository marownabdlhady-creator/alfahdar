export type Service = {
  /** Stable slug; also the photo filename in /public/services. */
  slug: string;
  /** Detail-page route. */
  href: string;
  title: string;
  /** One line on what the category covers (home cards). */
  summary: string;
  /** One or two sentences (services index, detail pages). */
  description: string;
  /** Short examples, rendered as a single muted line on the home cards. */
  examples: string[];
  /** The full offering, listed on the services index and detail pages. */
  subServices: string[];
  image: string;
  alt: string;
};

/* Order matters: the first entry is the featured card on the home page.
   Photos in /public/services are temporary stand-ins — swapping a file
   keeps everything else untouched. */
export const SERVICES: Service[] = [
  {
    slug: "construction",
    href: "/services/construction",
    title: "المقاولات والبناء",
    summary: "تنفيذ كامل من الأساس حتى التسليم، بإشراف هندسي وجدول واضح.",
    description:
      "ننفّذ مشاريع المقاولات من الأساسات حتى التسليم، بإشراف هندسي وجدول زمني واضح. نتولّى البناء الجديد والترميم وأعمال الخرسانة والعزل بكل تفاصيلها.",
    examples: ["مقاولات عامة", "بناء وترميم", "أعمال خرسانية", "عزل", "هدم"],
    subServices: [
      "مقاولات عامة",
      "بناء وترميم",
      "أعمال خرسانية",
      "مباني",
      "عزل",
      "هدم وإزالة",
      "أعمال خارجية",
    ],
    image: "/services/construction.jpg",
    alt: "المقاولات والبناء - الفهدار",
  },
  {
    slug: "finishing",
    href: "/services/finishing",
    title: "التشطيبات",
    summary: "لمسات نهائية تُظهر قيمة المكان وتدوم طويلاً.",
    description:
      "التشطيب هو ما تراه كل يوم، ولذلك ننفّذه بدقة تليق بالمكان. من الدهانات والأرضيات إلى الرخام والجبس بورد، بمواد مختارة ويد عاملة متخصصة.",
    examples: ["دهانات", "سيراميك", "رخام", "جبس بورد", "ديكورات"],
    subServices: [
      "دهانات ونقاشة",
      "سيراميك",
      "بورسلان",
      "رخام",
      "حجر طبيعي",
      "جبس بورد",
      "ديكورات",
      "أرضيات",
      "أسقف",
      "تركيب أبواب وشبابيك",
    ],
    image: "/services/finishing.jpg",
    alt: "التشطيبات - الفهدار",
  },
  {
    slug: "technical",
    href: "/services/technical",
    title: "الأعمال الفنية",
    summary: "تمديدات وأنظمة منفّذة على الأصول ومطابقة للمواصفات.",
    description:
      "أعمال الكهرباء والسباكة والتكييف والتمديدات، منفّذة على الأصول ومطابقة للمواصفات. فنيون مختصون لكل نوع من الأعمال، بلا حلول مؤقتة.",
    examples: ["كهرباء", "سباكة", "تكييف", "تمديدات"],
    subServices: [
      "كهرباء",
      "سباكة",
      "تكييف",
      "تمديدات",
      "صيانة وتركيب الأجهزة",
    ],
    image: "/services/technical.jpg",
    alt: "الأعمال الفنية - الفهدار",
  },
  {
    slug: "maintenance",
    href: "/services/maintenance",
    title: "الصيانة",
    summary: "استجابة سريعة لأعطال المنزل وعقود صيانة دورية.",
    description:
      "صيانة سريعة وموثوقة لأجهزة منزلك وأنظمته، سواء كان عطلاً طارئاً أو عقد صيانة دورية. نصل إليك في الموعد، ونُنهي العمل من أول زيارة قدر الإمكان.",
    examples: ["مكيفات", "غسالات", "ثلاجات", "صيانة دورية", "إصلاح أعطال"],
    subServices: [
      "صيانة مكيفات",
      "صيانة غسالات",
      "صيانة ثلاجات",
      "صيانة الأجهزة المنزلية",
      "صيانة دورية",
      "إصلاح الأعطال",
      "عقود صيانة",
    ],
    image: "/services/maintenance.jpg",
    alt: "الصيانة - الفهدار",
  },
  {
    slug: "supply",
    href: "/services/supply",
    title: "التوريد والمواد",
    summary: "مواد ومستلزمات مختارة تصل إلى موقعك في وقتها.",
    description:
      "نوفّر مواد البناء والتشطيب وقطع الغيار بجودة مضمونة وتوريد في وقته. رخام وحجر طبيعي وسيراميك ومستلزمات تصل إلى موقعك جاهزة للتنفيذ.",
    examples: ["رخام", "حجر طبيعي", "سيراميك", "مواد بناء", "قطع غيار"],
    subServices: [
      "حجر طبيعي",
      "رخام",
      "سيراميك",
      "مواد بناء",
      "مستلزمات التشطيب",
      "قطع الغيار",
    ],
    image: "/services/supply.jpg",
    alt: "التوريد والمواد - الفهدار",
  },
];
