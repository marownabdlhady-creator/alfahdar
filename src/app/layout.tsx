import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter, Playfair_Display } from "next/font/google";

import { SITE_URL } from "@/lib/site";
import "./globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter-latin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Lets pages set canonical/OG URLs as plain site-relative paths.
  metadataBase: new URL(SITE_URL),
  title: "الفهدار",
  description: "كل ما يحتاجه دارك في مكان واحد",
};

/** Document shell only: language, direction, fonts. The public site's
    header and footer live in the (site) group's layout, so /admin can be
    its own bare shell under the same document. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexSansArabic.variable} ${playfairDisplay.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
