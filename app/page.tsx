// Accueil : toutes les sections de docs/maquettes/Main.dc.html.
import Link from "next/link";
import { Bento } from "@/components/home/Bento";
import { CateringTeaser } from "@/components/home/CateringTeaser";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Intro } from "@/components/home/Intro";
import { Location } from "@/components/home/Location";
import { Marquees } from "@/components/home/Marquees";
import { ReserveCta } from "@/components/home/ReserveCta";
import { Stats } from "@/components/home/Stats";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { FadeUp } from "@/components/motion/FadeUp";
import { getFeaturedDishes, getMenu } from "@/lib/api/menu";
import { getSettings } from "@/lib/api/settings";

export const revalidate = 600;

export default async function HomePage() {
  const [settings, featured, menu] = await Promise.all([getSettings(), getFeaturedDishes(), getMenu()]);
  const dishes = menu.flatMap((category) => category.subcategories.flatMap((sub) => sub.dishes));
  // Pour le téléphone de « Comment ça marche » : les plats avec photo d'abord.
  const sample = [...dishes].sort((a, b) => Number(!!b.photo) - Number(!!a.photo)).slice(0, 3);

  return (
    // overflow-x clip (jamais hidden) : coupe les bandeaux inclinés sans casser le téléphone collant.
    <main className="overflow-x-clip">
      <Intro />
      <Hero dishes={featured} hours={settings.opening_hours} />
      <Marquees dishes={featured} />
      <Bento settings={settings} dishes={featured} />

      <section id="carte" className="flex flex-col items-center gap-[30px] pt-[104px]">
        <FadeUp className="flex max-w-[1200px] flex-col items-center gap-2.5 px-6 text-center">
          <span className="text-[13px] font-bold tracking-[0.14em] text-bordeaux uppercase">La carte</span>
          <h2 className="text-[clamp(36px,4.4vw,60px)] leading-[1.02]">
            Du petit-déjeuner au <span className="text-bordeaux italic">dessert.</span>
          </h2>
          <p className="max-w-[520px] text-[17px] text-texte-doux">
            Faites glisser la roue pour choisir une catégorie, puis faites défiler les plats du doigt.
          </p>
        </FadeUp>
        <div className="w-full">
          <MenuExplorer categories={menu} whatsapp={settings.whatsapp} />
        </div>
        <Link
          href="/carte"
          className="rounded-full bg-encre px-8 py-[17px] text-[17px] font-bold text-creme transition-opacity hover:opacity-90"
        >
          Voir toute la carte
        </Link>
      </section>

      <HowItWorks dishes={sample} />
      <CateringTeaser whatsapp={settings.whatsapp} />
      <Stats hours={settings.opening_hours} dishCount={dishes.length} />
      <ReserveCta maxParty={settings.reservation_max_party} />
      <Faq settings={settings} />
      <Location settings={settings} />
      <FinalCta />
    </main>
  );
}
