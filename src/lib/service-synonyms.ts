import type { ServiceSlug } from "@/lib/service-category";

/* The one piece of data the search adds on top of src/lib/services.ts.

   The catalogue is written in the formal Arabic of a company profile;
   people search in the words they actually use — "بويه" for الدهانات،
   "تلاجة" for الثلاجات، "كهربجي" for الكهرباء، "AC" for التكييف. Each rule
   below points a bundle of those words at a category, and usually at one
   exact sub-service inside it.

   Editing this file is how the search gets smarter: add keywords to a
   rule, or add a rule. Nothing else needs to change — the names, the
   routes and the categories still come from the catalogue.

   Keywords are normalized (normalizeArabic) when the index is built, so
   they can be written naturally here: hamza, ة, ى and harakat all fold on
   their own, and there is no need to spell out those variants. */

export type ServiceSynonym = {
  /** What a visitor might type. Order is irrelevant. */
  keywords: string[];
  category: ServiceSlug;
  /** The exact `name` of a sub-service in that category. Omit to point at
      the category itself. A name that no longer exists falls back to the
      category, so renaming a sub-service weakens the ranking instead of
      dropping the rule on the floor. */
  subService?: string;
};

export const SERVICE_SYNONYMS: ServiceSynonym[] = [
  /* --- المقاولات والبناء ---------------------------------------- */
  {
    keywords: [
      "مقاول",
      "مقاولين",
      "مقاولات",
      "مقاولات عامة",
      "بناء",
      "بنا",
      "تعمير",
      "عمار",
      "إنشاء",
      "إنشاءات",
      "مشروع بناء",
      "بناء فيلا",
      "بناء بيت",
      "contractor",
      "construction",
    ],
    category: "construction",
    subService: "مقاولات عامة",
  },
  {
    keywords: [
      "ترميم",
      "تجديد",
      "تجديد منزل",
      "ترميم فيلا",
      "ترميم مبنى",
      "إعادة تأهيل",
      "بيت قديم",
    ],
    category: "construction",
    subService: "بناء وترميم",
  },
  {
    keywords: [
      "خرسانة",
      "صبة",
      "صب",
      "أساسات",
      "قواعد",
      "أعمدة",
      "سقف خرساني",
      "حديد تسليح",
      "concrete",
    ],
    category: "construction",
    subService: "أعمال خرسانية",
  },
  {
    keywords: ["عظم", "مباني", "طوب", "بلوك", "بلك", "جدران", "حوائط"],
    category: "construction",
    subService: "مبانٍ",
  },
  {
    keywords: [
      "عزل",
      "عزل مائي",
      "عزل حراري",
      "عزل أسطح",
      "عزل خزانات",
      "تسريب سطح",
      "رطوبة",
      "فوم",
    ],
    category: "construction",
    subService: "عزل",
  },
  {
    keywords: ["هدم", "إزالة", "تكسير", "مخلفات بناء"],
    category: "construction",
    subService: "هدم وإزالة",
  },
  {
    keywords: ["سور", "أسوار", "ممرات", "تنسيق خارجي", "حوش", "مظلات"],
    category: "construction",
    subService: "أعمال خارجية",
  },

  /* --- التشطيبات ------------------------------------------------ */
  {
    keywords: [
      "تشطيب",
      "تشطيبات",
      "تشطيب شقة",
      "تشطيب فيلا",
      "تشطيب محل",
      "finishing",
    ],
    category: "finishing",
  },
  {
    keywords: [
      "دهان",
      "دهانات",
      "بوية",
      "بويه",
      "نقاشة",
      "نقاش",
      "صبغ",
      "طلاء",
      "دهان جدران",
      "ورق جدران",
      "paint",
    ],
    category: "finishing",
    subService: "دهانات ونقاشة",
  },
  {
    keywords: ["سيراميك", "سراميك", "بلاط", "تبليط", "ceramic"],
    category: "finishing",
    subService: "سيراميك",
  },
  {
    keywords: ["بورسلان", "بورسلين", "porcelain"],
    category: "finishing",
    subService: "بورسلان",
  },
  {
    keywords: ["رخام", "مرمر", "تركيب رخام", "marble"],
    category: "finishing",
    subService: "رخام",
  },
  {
    keywords: ["حجر", "حجر طبيعي", "تكسية", "واجهة حجر", "stone"],
    category: "finishing",
    subService: "حجر طبيعي",
  },
  {
    keywords: [
      "جبس",
      "جبسون",
      "جبس بورد",
      "جبسم بورد",
      "أسقف جبس",
      "gypsum",
    ],
    category: "finishing",
    subService: "جبس بورد",
  },
  {
    keywords: ["ديكور", "ديكورات", "ديكور داخلي", "decor"],
    category: "finishing",
    subService: "ديكورات",
  },
  {
    keywords: [
      "أرضيات",
      "أرضية",
      "باركيه",
      "لامينيت",
      "فينيل",
      "موكيت",
      "parquet",
    ],
    category: "finishing",
    subService: "أرضيات",
  },
  {
    keywords: ["أسقف", "سقف معلق", "أسقف معلقة", "أسقف ديكور"],
    category: "finishing",
    subService: "أسقف",
  },
  {
    keywords: [
      "باب",
      "أبواب",
      "شباك",
      "شبابيك",
      "نوافذ",
      "ألمنيوم",
      "الوميتال",
      "تركيب باب",
      "قفل باب",
    ],
    category: "finishing",
    subService: "تركيب أبواب وشبابيك",
  },

  /* --- الأعمال الفنية ------------------------------------------- */
  {
    keywords: [
      "كهربا",
      "كهرباء",
      "كهربائي",
      "كهربجي",
      "إضاءة",
      "إنارة",
      "لمبات",
      "أسلاك",
      "لوحة كهرباء",
      "قاطع كهرباء",
      "قصر كهربائي",
      "تمديد كهرباء",
      "مفاتيح كهرباء",
      "electric",
      "electrician",
    ],
    category: "technical",
    subService: "كهرباء",
  },
  {
    keywords: [
      "سباك",
      "سباكة",
      "مواسير",
      "ماسورة",
      "تسريب",
      "تسريب مياه",
      "تسليك",
      "صرف",
      "مجاري",
      "بلاعة",
      "حنفية",
      "خلاط مياه",
      "سخان",
      "مضخة مياه",
      "خزان مياه",
      "plumber",
      "plumbing",
    ],
    category: "technical",
    subService: "سباكة",
  },
  {
    keywords: [
      "مكيف",
      "مكيفات",
      "تكييف",
      "اسبليت",
      "سبليت",
      "تكييف مركزي",
      "دكت",
      "تركيب مكيف",
      "ac",
      "split",
      "hvac",
    ],
    category: "technical",
    subService: "تكييف",
  },
  {
    keywords: ["تمديدات", "تمديد", "تأسيس", "شبكات", "خطوط", "توصيلات"],
    category: "technical",
    subService: "تمديدات",
  },
  {
    keywords: [
      "فني",
      "فنيين",
      "أعمال فنية",
      "تركيب أجهزة",
      "تركيب شاشة",
      "تركيب ستائر",
      "تركيب",
    ],
    category: "technical",
    subService: "صيانة وتركيب الأجهزة",
  },

  /* --- الصيانة -------------------------------------------------- */
  {
    keywords: ["صيانة", "maintenance"],
    category: "maintenance",
  },
  {
    keywords: [
      "صيانة مكيف",
      "صيانة مكيفات",
      "تنظيف مكيف",
      "غسيل مكيف",
      "فريون",
      "مكيف لا يبرد",
      "مكيف",
      "مكيفات",
      "تكييف",
    ],
    category: "maintenance",
    subService: "صيانة مكيفات",
  },
  {
    keywords: ["غسالة", "غسالات", "نشافة", "washing machine"],
    category: "maintenance",
    subService: "صيانة غسالات",
  },
  {
    keywords: [
      "ثلاجة",
      "ثلاجات",
      "تلاجة",
      "براد",
      "فريزر",
      "تبريد",
      "fridge",
    ],
    category: "maintenance",
    subService: "صيانة ثلاجات",
  },
  {
    keywords: [
      "أجهزة",
      "أجهزة منزلية",
      "فرن",
      "بوتاجاز",
      "مايكرويف",
      "غسالة صحون",
      "سخان ماء",
      "مروحة",
    ],
    category: "maintenance",
    subService: "صيانة الأجهزة المنزلية",
  },
  {
    keywords: ["صيانة دورية", "فحص دوري", "كشف دوري"],
    category: "maintenance",
    subService: "صيانة دورية",
  },
  {
    keywords: [
      "عطل",
      "أعطال",
      "معطل",
      "تصليح",
      "إصلاح",
      "طارئ",
      "مستعجل",
      "repair",
    ],
    category: "maintenance",
    subService: "إصلاح الأعطال",
  },
  {
    keywords: ["عقد صيانة", "عقود صيانة", "اشتراك صيانة", "صيانة سنوية"],
    category: "maintenance",
    subService: "عقود صيانة",
  },

  /* --- التوريد والمواد ------------------------------------------ */
  {
    keywords: [
      "توريد",
      "مواد",
      "مواد بناء",
      "شراء مواد",
      "توصيل مواد",
      "أسمنت",
      "رمل",
      "حديد",
      "طوب",
      "supply",
    ],
    category: "supply",
    subService: "مواد بناء",
  },
  {
    keywords: ["توريد رخام", "رخام", "مرمر"],
    category: "supply",
    subService: "رخام",
  },
  {
    keywords: ["توريد حجر", "حجر طبيعي", "حجر"],
    category: "supply",
    subService: "حجر طبيعي",
  },
  {
    keywords: ["توريد سيراميك", "سيراميك", "بورسلان", "بلاط"],
    category: "supply",
    subService: "سيراميك",
  },
  {
    keywords: ["مستلزمات", "مستلزمات تشطيب", "أدوات"],
    category: "supply",
    subService: "مستلزمات التشطيب",
  },
  {
    keywords: ["قطع غيار", "قطعة غيار", "سبير", "spare parts"],
    category: "supply",
    subService: "قطع الغيار",
  },

  /* --- النظافة والتنظيف ----------------------------------------- */
  {
    keywords: [
      "نظافة",
      "نضافة",
      "تنظيف",
      "شركة نظافة",
      "شركة تنظيف",
      "تنظيف منزل",
      "تنظيف بيت",
      "تنظيف شقة",
      "تنظيف فيلا",
      "تنظيف قصر",
      "عمالة نظافة",
      "cleaning",
    ],
    category: "cleaning",
    subService: "تنظيف منازل وفلل وقصور",
  },
  {
    keywords: ["تنظيف مكاتب", "مكتب", "تنظيف شركات", "تنظيف محلات"],
    category: "cleaning",
    subService: "تنظيف مكاتب",
  },
  {
    keywords: ["مسجد", "مساجد", "جامع", "تنظيف مسجد"],
    category: "cleaning",
    subService: "تنظيف مساجد",
  },
  {
    keywords: ["حديقة", "حدائق", "جنينة", "تنظيف حديقة"],
    category: "cleaning",
    subService: "تنظيف حدائق",
  },
  {
    keywords: ["مدرسة", "مدارس", "تنظيف مدرسة", "روضة"],
    category: "cleaning",
    subService: "تنظيف مدارس",
  },
  {
    keywords: [
      "سجاد",
      "موكيت",
      "كنب",
      "مجالس",
      "مفروشات",
      "ستائر",
      "غسيل كنب",
      "غسيل سجاد",
      "تنظيف بالبخار",
    ],
    category: "cleaning",
    subService: "تنظيف سجاد ومفروشات",
  },
  {
    keywords: ["تعقيم", "تطهير", "معقم", "جراثيم", "بكتيريا"],
    category: "cleaning",
    subService: "تعقيم شامل",
  },
  {
    keywords: [
      "حشرات",
      "مكافحة حشرات",
      "رش مبيد",
      "مبيد",
      "صراصير",
      "نمل",
      "بق",
      "فئران",
      "قوارض",
      "آفات",
    ],
    category: "cleaning",
    subService: "مكافحة الجراثيم والآفات",
  },

  /* --- التصميمات الهندسية --------------------------------------- */
  {
    keywords: [
      "تصميم",
      "معماري",
      "تصميم معماري",
      "مهندس",
      "هندسي",
      "مكتب هندسي",
      "رسم هندسي",
      "architect",
      "design",
    ],
    category: "engineering",
    subService: "تصميم معماري",
  },
  {
    keywords: ["إنشائي", "تصميم إنشائي", "حسابات إنشائية"],
    category: "engineering",
    subService: "تصميم إنشائي",
  },
  {
    keywords: [
      "مخطط",
      "مخططات",
      "رخصة",
      "رخصة بناء",
      "تصريح",
      "تصاريح",
      "كروكي",
      "بلدية",
      "أمانة",
    ],
    category: "engineering",
    subService: "مخططات وتصاريح البناء",
  },
  {
    keywords: ["تصميم داخلي", "انتيريور", "interior", "توزيع فراغات"],
    category: "engineering",
    subService: "تصميم داخلي",
  },
  {
    keywords: ["واجهة", "واجهات", "تصميم واجهة", "facade"],
    category: "engineering",
    subService: "تصميم الواجهات",
  },
  {
    keywords: ["كهروميكانيك", "كهروميكانيكية", "ميكانيكا", "mep"],
    category: "engineering",
    subService: "المخططات الكهروميكانيكية (MEP)",
  },
  {
    keywords: ["إشراف", "إشراف هندسي", "متابعة تنفيذ", "استشاري"],
    category: "engineering",
    subService: "الإشراف الهندسي",
  },
  {
    keywords: [
      "كميات",
      "حصر كميات",
      "مقايسة",
      "مقايسات",
      "تسعير",
      "جدول كميات",
      "boq",
    ],
    category: "engineering",
    subService: "حصر الكميات والمقايسات",
  },
];
