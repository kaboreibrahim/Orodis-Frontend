// Héros : badge d'ouverture, titre qui monte ligne par ligne avec soulignement dessiné,
// boutons, moyens de paiement, et un téléphone qui montre les plats mis en avant.
import { Bike, ChefHat, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { DishImage } from "@/components/menu/DishImage";
import { DrawUnderline } from "@/components/motion/DrawUnderline";
import { FadeUp } from "@/components/motion/FadeUp";
import { RiseText } from "@/components/motion/RiseText";
import type { DishDetail, OpeningHours } from "@/lib/api/types";
import { summarizeHours } from "@/lib/format";
import { OpenBadge } from "./OpenBadge";

const PAYMENTS = [
  { label: "Wave", dot: "bg-wave" },
  { label: "Orange Money", dot: "bg-orange-money" },
  { label: "MTN MoMo", dot: "bg-mtn" },
  { label: "Espèces", dot: "bg-especes" },
];

type HeroProps = {
  dishes: DishDetail[];
  hours?: OpeningHours;
};

export function Hero({ dishes, hours }: HeroProps) {
  return (
    <section
      id="accueil"
      className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-12 gap-y-14 px-6 pt-14 pb-[72px]"
    >
      <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-[26px]">
        <FadeUp immediate afterIntro className="self-start">
          <OpenBadge hours={hours} fallback={summarizeHours(hours)[0] ?? "Ouvert tous les jours"} />
        </FadeUp>

        <RiseText
          as="h1"
          afterIntro
          delay={0.1}
          className="text-[clamp(42px,6vw,84px)] leading-[0.98] tracking-[-0.025em] text-encre"
          lineClassName="pb-[0.2em] -mb-[0.14em]"
          lines={[
            <Fragment key="l1">
              Le <span className="whitespace-nowrap">savoir-faire</span>
            </Fragment>,
            <Fragment key="l2">
              à votre{" "}
              <DrawUnderline afterIntro className="text-bordeaux italic">
                service.
              </DrawUnderline>
            </Fragment>,
          ]}
        />

        <FadeUp as="p" immediate afterIntro delay={0.4} className="max-w-[520px] text-[clamp(17px,1.45vw,20px)] text-texte-doux">
          Spécialités africaines et européennes, pâtisserie maison. Sur place, à emporter ou en livraison.
        </FadeUp>

        <FadeUp immediate afterIntro delay={0.55} className="flex flex-wrap gap-3">
          <Link
            href="/#carte"
            className="rounded-full bg-bordeaux px-[30px] py-[17px] text-[17px] font-bold text-creme shadow-bouton transition-opacity hover:opacity-90"
          >
            Voir la carte
          </Link>
          <Link
            href="/#reserver"
            className="rounded-full border-[1.5px] border-encre bg-white px-[30px] py-[17px] text-[17px] font-bold text-encre transition-colors hover:bg-sable"
          >
            Réserver une table
          </Link>
        </FadeUp>

        <FadeUp
          immediate
          afterIntro
          delay={0.65}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-bold tracking-[0.06em] text-texte-doux uppercase"
        >
          <span>Payez avec</span>
          {PAYMENTS.map((payment) => (
            <span key={payment.label} className="inline-flex items-center gap-1.5 tracking-normal text-encre normal-case">
              <span aria-hidden="true" className={`size-[9px] rounded-full ${payment.dot}`} />
              {payment.label}
            </span>
          ))}
        </FadeUp>
      </div>

      {/* Le visuel ne grandit pas : la place libre va au titre, qui tient sur deux lignes. */}
      <FadeUp immediate afterIntro delay={0.4} className="flex min-w-0 flex-[1_1_400px] justify-center lg:flex-[0_1_440px]">
        <HeroVisual dishes={dishes} />
      </FadeUp>
    </section>
  );
}

/** Illustration : cercle bordeaux, téléphone avec les plats mis en avant et trois cartes flottantes. */
function HeroVisual({ dishes }: { dishes: DishDetail[] }) {
  return (
    <div aria-hidden="true" className="relative h-[520px] w-[460px] max-w-full sm:h-[600px]">
      <div className="absolute top-1/2 left-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bordeaux sm:size-[440px]" />
      <div className="absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-bordeaux/25 sm:size-[540px]" />

      <div className="absolute top-5 left-1/2 h-[560px] w-[270px] origin-top -translate-x-1/2 scale-[0.86] rounded-[44px] bg-encre p-2.5 shadow-telephone sm:scale-100">
        <div className="relative size-full overflow-hidden rounded-[35px] bg-creme">
          <div className="absolute top-[9px] left-1/2 h-6 w-[84px] -translate-x-1/2 rounded-[14px] bg-encre" />
          <div className="flex flex-col gap-3 px-4 pt-[46px] pb-4">
            <div className="flex items-center justify-between">
              <Image src="/logo-delices-orodis-web.png" alt="" width={41} height={36} className="h-9 w-auto" />
              <span className="rounded-full bg-rose px-2.5 py-1 text-[11px] font-bold text-bordeaux">La carte</span>
            </div>
            <div className="font-display text-[22px] leading-[1.05] font-bold">Que désirez-vous ?</div>
            <div className="flex gap-1.5 text-[11px] font-bold">
              <span className="rounded-full bg-bordeaux px-2.5 py-1.5 text-creme">Africain</span>
              <span className="rounded-full border border-bordure bg-white px-2.5 py-1.5">Européen</span>
              <span className="rounded-full border border-bordure bg-white px-2.5 py-1.5">Pâtisserie</span>
            </div>
            <div className="flex flex-col gap-2">
              {dishes.slice(0, 3).map((dish) => (
                <div key={dish.id} className="flex items-center gap-2.5 rounded-[14px] bg-white p-2">
                  <span className="relative h-11 w-[50px] shrink-0 overflow-hidden rounded-[10px]">
                    <DishImage dish={dish} sizes="50px" initialClassName="text-xl" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold">{dish.name}</span>
                    <span className="block truncate text-[11px] text-texte-doux">{dish.description}</span>
                  </span>
                  <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-bordeaux text-creme">
                    <Plus size={16} strokeWidth={3} />
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex h-11 items-center justify-center rounded-full bg-bordeaux text-sm font-bold text-creme">
              Voir toute la carte
            </div>
          </div>
        </div>
      </div>

      <FloatingCard className="top-24 left-0 sm:-left-[18px]" icon={<ChefHat size={20} className="text-bordeaux" />} iconClassName="bg-rose" title="Fait maison" text="cuisiné chaque jour" />
      <FloatingCard
        className="top-[300px] right-0 sm:-right-[22px]"
        icon={<span className="size-4 rounded-full bg-wave" />}
        iconClassName="bg-wave/15"
        title="Paiement Wave"
        text="et Mobile Money"
      />
      <FloatingCard
        dark
        className="bottom-10 left-0"
        icon={<Bike size={20} className="text-encre" />}
        iconClassName="bg-jaune"
        title="Livré chaud"
        text="chez vous"
      />
    </div>
  );
}

type FloatingCardProps = {
  className: string;
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  text: string;
  dark?: boolean;
};

function FloatingCard({ className, icon, iconClassName, title, text, dark = false }: FloatingCardProps) {
  return (
    <div
      className={`absolute flex items-center gap-2.5 rounded-[18px] px-4 py-3 shadow-carte ${
        dark ? "bg-encre text-creme" : "bg-white text-encre"
      } ${className}`}
    >
      <span className={`flex size-9 items-center justify-center rounded-[11px] ${iconClassName}`}>{icon}</span>
      <span>
        <span className="block text-sm font-bold">{title}</span>
        <span className={`block text-xs ${dark ? "text-texte-sur-encre" : "text-texte-doux"}`}>{text}</span>
      </span>
    </div>
  );
}
