"use client";

// Formule choisie, partagée entre les cartes « Nos formules » et le formulaire de devis :
// « Choisir cette formule » la pré-sélectionne dans le formulaire, et la carte choisie s'entoure de bordeaux.
import { createContext, type ReactNode, useContext, useState } from "react";
import { UNDECIDED_FORMULA } from "@/lib/schemas";

type FormulaChoiceValue = { formula: string; setFormula: (slug: string) => void };

const FormulaChoiceContext = createContext<FormulaChoiceValue | null>(null);

export function FormulaChoiceProvider({ children }: { children: ReactNode }) {
  const [formula, setFormula] = useState<string>(UNDECIDED_FORMULA);
  return <FormulaChoiceContext value={{ formula, setFormula }}>{children}</FormulaChoiceContext>;
}

export function useFormulaChoice(): FormulaChoiceValue {
  const value = useContext(FormulaChoiceContext);
  if (!value) throw new Error("useFormulaChoice doit être utilisé dans <FormulaChoiceProvider>.");
  return value;
}
