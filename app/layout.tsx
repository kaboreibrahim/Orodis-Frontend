import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { getSettings } from "@/lib/api/settings";
import { summarizeHours } from "@/lib/format";
import { INTRO_SCRIPT } from "@/lib/intro";
import { homeDescription, LOCATION, SITE_NAME, siteUrl } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Valeurs par défaut de tout le site ; chaque page publique précise les siennes (lib/seo.ts, pageMetadata).
// Description tirée des horaires saisis dans l'admin, pour ne jamais annoncer des horaires faux.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${SITE_NAME} · Restaurant et traiteur à ${LOCATION.city}`,
      template: `%s · ${SITE_NAME}`,
    },
    description: homeDescription(summarizeHours(settings.opening_hours).join(", ")),
    applicationName: SITE_NAME,
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: { type: "website", locale: "fr_CI", siteName: SITE_NAME },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // En-tête, pied de page et JSON-LD du restaurant : app/(site)/layout.tsx ; l'app de table (/t/…) a sa propre mise en page.
  return (
    // suppressHydrationWarning : le script du <head> pose data-intro avant l'hydratation.
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
