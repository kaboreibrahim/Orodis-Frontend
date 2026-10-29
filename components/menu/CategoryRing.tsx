"use client";

// Anneau des catégories : chaque carte est placée par rotate(i × 26°) translateY(-R) autour d'un centre
// situé sous l'écran ; l'anneau tourne au doigt, sans flèches.
import { motion, useTransform, type MotionValue } from "motion/react";
import { useId } from "react";
import { useFlowPosition } from "@/components/motion/useFlowPosition";
import type { Category } from "@/lib/api/types";

const STEP_DEG = 26;

type CategoryRingProps = {
  categories: Category[];
  active: number;
  onChange: (index: number) => void;
};

export function dishCount(category: Category): number {
  return category.subcategories.reduce((total, sub) => total + sub.dishes.length, 0);
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n > 1 ? "s" : ""}`;
}

export function CategoryRing({ categories, active, onChange }: CategoryRingProps) {
  const id = useId();
  const { pos, centered, handlers } = useFlowPosition({ active, count: categories.length, unit: 120, onChange });

  return (
    <div
      role="listbox"
      tabIndex={0}
      aria-label="Catégories : faites glisser ou utilisez les flèches pour tourner la roue"
      aria-activedescendant={`${id}-${active}`}
      {...handlers}
      className="relative cursor-grab touch-pan-y outline-offset-[-4px] select-none [--R:clamp(330px,34vw,500px)] [--rw:clamp(128px,12.5vw,180px)] active:cursor-grabbing"
      style={{ height: "calc(var(--rw) * 1.25 + 0.42 * var(--R) + 10px)" }}
    >
      {categories.map((category, i) => (
        <RingItem
          key={category.id}
          id={`${id}-${i}`}
          index={i}
          pos={pos}
          category={category}
          isActive={i === centered}
          onSelect={() => onChange(i)}
        />
      ))}
    </div>
  );
}

type RingItemProps = {
  id: string;
  index: number;
  pos: MotionValue<number>;
  category: Category;
  isActive: boolean;
  onSelect: () => void;
};

function RingItem({ id, index, pos, category, isActive, onSelect }: RingItemProps) {
  const transform = useTransform(pos, (p) => {
    const d = index - p;
    const scale = 1.08 - Math.min(Math.abs(d), 1) * 0.16;
    return `rotate(${(d * STEP_DEG).toFixed(2)}deg) translateY(calc(var(--R) * -1)) scale(${scale.toFixed(3)})`;
  });
  const zIndex = useTransform(pos, (p) => 10 - Math.round(Math.abs(index - p)));
  // Au-delà de deux crans, la carte descend trop bas sur le côté : elle s'efface (de 2,2 à 2,8).
  const opacity = useTransform(pos, (p) => Math.max(0, Math.min(1, (2.8 - Math.abs(index - p)) / 0.6)));
  const count = plural(dishCount(category), "plat");

  return (
    <motion.div
      id={id}
      role="option"
      aria-selected={isActive}
      aria-label={`${category.name}, ${count}`}
      onClick={onSelect}
      className={`absolute left-1/2 flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[22px] p-3.5 text-center transition-[background-color,box-shadow,border-color] duration-300 ${
        isActive ? "border border-transparent bg-bordeaux text-creme shadow-relief" : "border border-bordure bg-white text-encre shadow-pilule"
      }`}
      style={{
        top: "calc(var(--R) + var(--rw) * 0.62 + 10px)",
        width: "var(--rw)",
        height: "calc(var(--rw) * 1.25)",
        margin: "calc(var(--rw) * -0.625) 0 0 calc(var(--rw) * -0.5)",
        transform,
        zIndex,
        opacity,
      }}
    >
      <span
        aria-hidden="true"
        className={`flex size-[46px] items-center justify-center rounded-[14px] text-2xl transition-colors duration-300 ${
          isActive ? "bg-creme/15" : "bg-rose"
        }`}
      >
        {category.icon || category.name.charAt(0)}
      </span>
      <span className="font-display text-[clamp(16px,1.6vw,21px)] leading-[1.1] font-bold">{category.name}</span>
      <span className={`text-[13px] font-medium ${isActive ? "text-rose" : "text-texte-doux"}`}>{count}</span>
    </motion.div>
  );
}
