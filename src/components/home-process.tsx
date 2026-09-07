import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

const STEPS = [
  {
    number: "١",
    title: "اختر الخدمة",
    description: "حدّد الخدمة التي تحتاجها من قائمة خدماتنا.",
  },
  {
    number: "٢",
    title: "أرسل تفاصيل الطلب",
    description: "املأ النموذج وأرفق الصور وحدّد موقعك.",
  },
  {
    number: "٣",
    title: "يتواصل معك المختص",
    description: "يتواصل معك فريقنا لتأكيد التفاصيل والموعد.",
  },
  {
    number: "٤",
    title: "التنفيذ والمتابعة",
    description: "ننفّذ الخدمة ونتابع معك حتى إتمامها.",
  },
] as const;

export function HomeProcess() {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="bg-bg pb-section scroll-mt-28"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            id="process-heading"
            kicker="خطوات بسيطة"
            title="كيف تطلب خدمتك؟"
            lead="من الطلب حتى التنفيذ، العملية واضحة وسريعة."
          />
        </Reveal>

        {/* An ordered list keeps the sequence real for assistive tech; the
            grid flows right-to-left, so step ١ lands on the right. */}
        <ol className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.number}>
              <Reveal delay={index * 90} className="h-full">
                <div className="flex items-center gap-5">
                  <span
                    aria-hidden
                    className="text-step-4 leading-none font-bold text-accent"
                  >
                    {step.number}
                  </span>

                  {/* The connector: reaches past the gutter so the row
                      reads as one line into the next step. */}
                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="hidden h-px flex-1 -me-6 bg-line lg:block"
                    />
                  )}
                </div>

                <h3 className="mt-6 text-step-1 font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[34ch] text-step--1 text-muted">
                  {step.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
