import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

type Review = {
  /** Whole stars out of 5. */
  rating: number;
  quote: string;
  name: string;
  service: string;
};

// TODO: replace with real reviews (from client / dashboard)
const REVIEWS: Review[] = [
  {
    rating: 5,
    quote:
      "طلبت تشطيب فيلا وكانت المتابعة ممتازة من أول يوم. التزموا بالجدول، والتسليم كان أنظف مما توقعت.",
    name: "عبدالله الشمري",
    service: "تشطيب فيلا",
  },
  {
    rating: 5,
    quote:
      "تواصلت معهم لصيانة المكيفات في عز الصيف، وجاء الفني في نفس اليوم وأنهى العمل بسرعة وبالسعر المتفق عليه.",
    name: "نورة العتيبي",
    service: "صيانة مكيفات",
  },
  {
    rating: 4,
    quote:
      "نفّذوا تركيب الرخام في المدخل والدرج بدقة عالية. التشطيب النهائي مرتب، والفريق محترم في التعامل.",
    name: "فهد القحطاني",
    service: "تركيب رخام",
  },
  {
    rating: 5,
    quote:
      "أكثر ما يميزهم الوضوح في السعر. استلمت عرضاً مفصّلاً قبل البدء، ولم يُضَف أي مبلغ بعد ذلك.",
    name: "سارة الدوسري",
    service: "ترميم وصيانة عامة",
  },
];

const TOTAL_STARS = 5;

function Stars({ rating }: { rating: number }) {
  return (
    <div
      role="img"
      aria-label={`التقييم ${rating} من ${TOTAL_STARS}`}
      className="flex items-center gap-1"
    >
      {Array.from({ length: TOTAL_STARS }, (_, index) => (
        <svg
          key={index}
          aria-hidden
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 ${index < rating ? "text-accent" : "text-line"}`}
        >
          <path d="M10 1.6 12.4 6.7l5.6.8-4.1 3.9 1 5.5-4.9-2.6-4.9 2.6 1-5.5L2 7.5l5.6-.8L10 1.6Z" />
        </svg>
      ))}
    </div>
  );
}

export function HomeReviews() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="bg-bg pb-section scroll-mt-28"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            id="reviews-heading"
            kicker="آراء العملاء"
            title="ماذا يقول عملاؤنا"
            lead="تجارب حقيقية من عملاء تعاملوا معنا في المقاولات والتشطيبات والصيانة."
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {REVIEWS.map((review, index) => (
            <li key={review.name}>
              <Reveal delay={index * 80} className="h-full">
                <figure className="flex h-full flex-col rounded-xl border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(13,13,13,0.03)]">
                  <Stars rating={review.rating} />

                  <blockquote className="mt-5 flex-1 text-step-0">
                    {review.quote}
                  </blockquote>

                  <figcaption className="mt-6 border-t border-line pt-5">
                    <span className="block text-step--1 font-semibold">
                      {review.name}
                    </span>
                    <span className="mt-1 block text-step--1 text-muted">
                      {review.service}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
