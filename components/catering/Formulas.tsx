"use client";

// Les formules lues dans l'API ; « Choisir cette formule » la pré-sélectionne dans le formulaire et descend jusqu'à #devis.
import { Check } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import type { Formula } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { useFormulaChoice } from "./FormulaChoice";

export function Formulas({ formulas, minGuests }: { formulas: Formula[]; minGuests?: number }) {
  const { formula: chosen, setFormula } = useFormulaChoice();

  function choose(slug: string) {
    setFormula(slug);
    document.getElementById("devis")?.scrollIntoView({ block: "start" });
    // Le focus suit, pour le clavier et les lecteurs d'écran.
    document.getElementById("champ-formule")?.focus({ preventScroll: true });
  }

  return (
    <section aria-labelledby="formules" className="mx-auto flex max-w-[1200px] flex-col gap-[26px] px-6 pt-24">
      <div className="flex max-w-[640px] flex-col gap-2">
        <span className="text-[13px] font-bold tracking-[0.14em] text-bordeaux uppercase">Nos formules</span>
        <h2 id="formules" className="text-[clamp(32px,3.8vw,50px)] leading-[1.04]">
          {formulas.length === 3 ? "Trois façons de " : "Nos façons de "}
          <span className="text-bordeaux italic">recevoir.</span>
        </h2>
        <p className="text-texte-doux">Chaque devis est adapté à votre événement : menu, quantités, service et matériel.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
        {formulas.map((formula, i) => {
          const dark = formula.is_highlighted;
          const slug = formula.slug ?? "";
          const selected = chosen === slug;
          return (
            <FadeUp
              as="article"
              key={slug || formula.name}
              delay={i * 0.08}
              className={`flex flex-col gap-3.5 rounded-[26px] p-[26px] transition-shadow ${
                dark ? "bg-encre text-creme" : "border border-bordure bg-white text-encre"
              } ${selected ? "ring-[3px] ring-bordeaux ring-offset-2 ring-offset-creme" : ""}`}
            >
              {dark && (
                <span className="self-start rounded-full bg-jaune px-2.5 py-1 text-xs font-bold text-encre">Le plus demandé</span>
              )}
              <h3 className="text-[28px]">{formula.name}</h3>
              {formula.description && <p className="text-[15px] opacity-85">{formula.description}</p>}
              <p className="font-display text-[26px] font-bold">
                {formula.price_from != null ? (
                  <>
                    <span className="font-sans text-sm font-medium">à partir de </span>
                    {formatPrice(formula.price_from)}
                    <span className="font-sans text-sm font-medium"> / personne</span>
                  </>
                ) : (
                  "Prix sur devis"
                )}
              </p>
              {formula.items.length > 0 && (
                <ul className="flex flex-col gap-2 text-[15px]">
                  {formula.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check size={18} strokeWidth={2.6} aria-hidden="true" className={`mt-[3px] shrink-0 ${dark ? "text-jaune" : "text-bordeaux"}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => choose(slug)}
                aria-pressed={selected}
                className={`mt-auto min-h-[50px] rounded-full text-[15px] font-bold transition-opacity hover:opacity-90 ${
                  dark ? "bg-jaune text-encre" : "border-[1.5px] border-bordeaux bg-white text-bordeaux"
                }`}
              >
                {selected ? "Formule choisie" : "Choisir cette formule"}
              </button>
            </FadeUp>
          );
        })}
      </div>

      <p className="text-sm text-texte-doux">
        {minGuests ? `Minimum ${minGuests} invités · location` : "Location"} de matériel (tables, nappes, vaisselle) sur demande.
      </p>
    </section>
  );
}
