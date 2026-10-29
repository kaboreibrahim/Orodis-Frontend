// Pastille sélectionnable : un bouton radio natif (flèches du clavier, lecteurs d'écran) habillé en pilule.
import type { InputHTMLAttributes, ReactNode, Ref } from "react";

type ChipProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  children: ReactNode;
  /** Couleur une fois choisie : bordeaux (formulaires) ou encre (couverts). */
  tone?: "bordeaux" | "encre";
  ref?: Ref<HTMLInputElement>;
};

const TONES = {
  bordeaux: "peer-checked:border-bordeaux peer-checked:bg-bordeaux peer-checked:text-creme",
  encre: "peer-checked:border-encre peer-checked:bg-encre peer-checked:text-creme",
};

export function Chip({ children, tone = "bordeaux", className = "", ...input }: ChipProps) {
  return (
    <label className={`relative cursor-pointer has-disabled:cursor-not-allowed ${className}`}>
      <input type="radio" className="peer sr-only" {...input} />
      <span
        className={`flex min-h-11 items-center justify-center rounded-full border-[1.5px] border-bordure bg-white px-4 text-sm font-bold text-encre transition-colors peer-hover:border-encre/40 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bordeaux peer-disabled:opacity-50 ${TONES[tone]}`}
      >
        {children}
      </span>
    </label>
  );
}
