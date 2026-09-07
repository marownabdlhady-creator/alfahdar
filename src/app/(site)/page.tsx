import { HomeHero } from "@/components/home-hero";
import { HomeProcess } from "@/components/home-process";
import { HomeReviews } from "@/components/home-reviews";
import { HomeServices } from "@/components/home-services";
import { HomeWhy } from "@/components/home-why";

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
