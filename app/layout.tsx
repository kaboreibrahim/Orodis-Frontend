import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSettings } from "@/lib/api/settings";
import { summarizeHours } from "@/lib/format";
import { INTRO_SCRIPT } from "@/lib/intro";
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

// Description tirée des horaires saisis dans l'admin, pour ne jamais annoncer des horaires faux.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const hours = summarizeHours(settings.opening_hours).join(", ");
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: "Les Délices d'Orodis · Restaurant, pâtisserie et traiteur",
      template: "%s · Les Délices d'Orodis",
    },
    description: `Spécialités africaines et européennes, pâtisserie maison et traiteur.${
      hours ? ` ${hours}.` : ""
    } Sur place, à emporter ou en livraison.`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const contact = {
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    hours: summarizeHours(settings.opening_hours),
  };

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
      <body>
        <Header contact={contact} />
        {children}
        <Footer settings={settings} />
      </body>
    </html>
  );
}
