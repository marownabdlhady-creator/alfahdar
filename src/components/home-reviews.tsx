import { Reveal } from "@/components/reveal";
import { ReviewForm } from "@/components/review-form";
import { ReviewStars } from "@/components/review-stars";
import { SectionHeading } from "@/components/section-heading";
import { prisma } from "@/lib/prisma";

/** Two rows of four at most. Newest first, so a fresh approval leads. */
const MAX_REVIEWS = 6;

export async function HomeReviews() {
  /* Only what an admin has approved ever reaches this page: a submission
     lands with isApproved false and stays out of this query until the
     dashboard flips it. */
  const reviews = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    take: MAX_REVIEWS,
    select: {
      id: true,
      clientName: true,
      serviceLabel: true,
      rating: true,
      comment: true,
    },
  });

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

        {reviews.length === 0 ? (
          <Reveal>
            {/* Nothing approved yet. An empty grid would read as a fault,
                so the section asks for the first review instead. */}
            <p className="mt-14 rounded-xl border border-line bg-surface px-6 py-12 text-center text-step-0 text-muted">
              كن أول من يشاركنا رأيه في خدمات الفهدار.
            </p>
          </Reveal>
        ) : (
          <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {reviews.map((review, index) => (
              <li key={review.id}>
                <Reveal delay={index * 80} className="h-full">
                  <figure className="flex h-full flex-col rounded-xl border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(13,13,13,0.03)]">
                    <ReviewStars rating={review.rating} />

                    <blockquote className="mt-5 flex-1 text-step-0 break-words">
                      {review.comment}
                    </blockquote>

                    <figcaption className="mt-6 border-t border-line pt-5">
                      <span className="block text-step--1 font-semibold break-words">
                        {review.clientName}
                      </span>
                      <span className="mt-1 block text-step--1 text-muted">
                        {review.serviceLabel}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 min-w-0">
          <ReviewForm />
        </div>
      </div>
    </section>
  );
}
