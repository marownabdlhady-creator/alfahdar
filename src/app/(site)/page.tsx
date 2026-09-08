import { HomeHero } from "@/components/home-hero";
import { HomeProcess } from "@/components/home-process";
import { HomeReviews } from "@/components/home-reviews";
import { HomeServices } from "@/components/home-services";
import { HomeWhy } from "@/components/home-why";

/* The reviews section reads approved reviews from the database, and the
   dashboard revalidates this path whenever one is approved, unapproved or
   deleted. The hourly figure is only a backstop for a revalidation that
   never arrived. */
export const revalidate = 3600;

/* Vertical rhythm: the services section opens the light run with
   py-section, and every section after it carries pb-section only —
   so one section unit separates each block, all the way to the footer. */
export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeServices />
      <HomeWhy />
      <HomeProcess />
      <HomeReviews />
    </>
  );
}
