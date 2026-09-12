import Image from "next/image";

/* public/alfahdar-logo.svg is a 747x392 canvas (~1.91:1) with a
   transparent background — the dark rect the exporter left in the file
   sits outside the viewBox, so it never paints.

   The artwork itself is drawn for a DARK backdrop: the bars and the
   ALFAHDAR wordmark are a white-to-silver metallic gradient, with bronze
   and gold accents. On the site's off-white surfaces the silver all but
   vanishes, so `backdrop="light"` renders the mark as a solid ink
   silhouette instead — legible everywhere, at the cost of the gold.
   A second, dark-ink version of the asset would beat the filter. */

const LOGO = { src: "/alfahdar-logo.svg", width: 747, height: 392 } as const;

export function BrandLogo({
  backdrop,
  className = "",
  eager = false,
}: {
  /** The surface behind the logo, not the logo's own colour. */
  backdrop: "light" | "dark";
  /** Sets the height; the width follows from the intrinsic ratio. */
  className?: string;
  eager?: boolean;
}) {
  return (
    <Image
      src={LOGO.src}
      alt="ALFAHDAR"
      width={LOGO.width}
      height={LOGO.height}
      /* Vector: nothing to resample, and crisp at any DPR. Next skips the
         optimizer for .svg anyway — this just says so out loud. */
      unoptimized
      loading={eager ? "eager" : "lazy"}
      className={[
        /* w-auto lets the className below set the height alone, while the
           width/height above still reserve the right box — no shift. */
        "w-auto",
        backdrop === "light" ? "brightness-0" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
