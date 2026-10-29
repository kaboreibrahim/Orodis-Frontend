// Appel final de l'accueil, juste avant le pied de page.
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-[104px]">
      <FadeUp className="relative flex flex-wrap items-center justify-between gap-[30px] overflow-hidden rounded-[40px] bg-bordeaux p-[clamp(36px,5vw,72px)]">
        <span
          aria-hidden="true"
          className="absolute -top-20 -right-20 size-80 rounded-full border-[30px] border-jaune/15"
        />
        <h2 className="relative max-w-[640px] text-[clamp(38px,5vw,70px)] leading-[0.98] text-creme">
          Une faim ? <span className="text-jaune italic">On s’occupe de tout.</span>
        </h2>
        <div className="relative flex flex-wrap gap-3">
          <Link href="/#carte" className="rounded-full bg-jaune px-[30px] py-[17px] text-[17px] font-bold text-encre transition-opacity hover:opacity-90">
            Voir la carte
          </Link>
          <Link
            href="/reserver"
            className="rounded-full border-[1.5px] border-creme px-[30px] py-[17px] text-[17px] font-bold text-creme transition-colors hover:bg-creme/10"
          >
            Réserver une table
          </Link>
        </div>
      </FadeUp>
    </section>
  );
}
