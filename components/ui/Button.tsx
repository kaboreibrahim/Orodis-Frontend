// Bouton en pilule ; buttonClass() donne le même style à un lien.
import type { ButtonHTMLAttributes } from "react";

const VARIANTS = {
  primary: "bg-bordeaux text-creme shadow-bouton hover:opacity-90 disabled:bg-bordure disabled:text-texte-doux disabled:shadow-none",
  outline: "border-[1.5px] border-bordure bg-white text-encre hover:bg-sable",
  whatsapp: "bg-whatsapp text-white hover:opacity-90",
  jaune: "bg-jaune text-encre hover:opacity-90",
} as const;

const SIZES = {
  md: "min-h-12 px-6 text-[15px]",
  lg: "min-h-14 px-7 text-[17px]",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

export function buttonClass(variant: ButtonVariant = "primary", size: keyof typeof SIZES = "md", className = ""): string {
  return `inline-flex items-center justify-center gap-2 rounded-full font-bold transition-[opacity,background-color] disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
};

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}
