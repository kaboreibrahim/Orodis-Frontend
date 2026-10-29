"use client";

// CouvertureFlow : les cartes pivotent en 3D selon leur écart au centre (rotateY, translateZ, décalage),
// glissement au doigt, points indicateurs, clic ignoré après un glissement.
import { motion, useTransform, type MotionValue } from "motion/react";
import { useId, type ReactNode } from "react";
import { useFlowPosition } from "@/components/motion/useFlowPosition";

type CoverFlowProps<T> = {
  items: T[];
  active: number;
  onChange: (index: number) => void;
  /** Clic ou Entrée sur la carte du centre. */
  onActivate?: (index: number) => void;
  getKey: (item: T) => string | number;
  getLabel: (item: T, isActive: boolean) => string;
  renderItem: (item: T, isActive: boolean) => ReactNode;
  /** Variable CSS de la largeur d'une carte, déclarée par le parent (ex. "--cw"). */
  widthVar: string;
  /** Taille et forme d'une carte. */
  itemClassName: (isActive: boolean) => string;
  /** Hauteur de la zone, ex. "calc(var(--cw) * 1.4 + 30px)". */
  height: string;
  /** Distance du doigt (px) pour passer d'une carte à la suivante. */
  unit: number;
  label: string;
  perspective?: number;
  dots?: boolean;
};

export function CoverFlow<T>({
  items,
  active,
  onChange,
  onActivate,
  getKey,
  getLabel,
  renderItem,
  widthVar,
  itemClassName,
  height,
  unit,
  label,
  perspective = 1000,
  dots = false,
}: CoverFlowProps<T>) {
  const id = useId();
  const { pos, centered, handlers } = useFlowPosition({ active, count: items.length, unit, onChange, onActivate });

  return (
    <div>
      <div
        role="listbox"
        tabIndex={0}
        aria-label={label}
        aria-activedescendant={`${id}-${active}`}
        {...handlers}
        className="relative cursor-grab touch-pan-y outline-offset-[-4px] select-none [transform-style:preserve-3d] active:cursor-grabbing"
        style={{ height, perspective }}
      >
        {items.map((item, i) => (
          <FlowItem
            key={getKey(item)}
            id={`${id}-${i}`}
            index={i}
            pos={pos}
            widthVar={widthVar}
            isActive={i === centered}
            label={getLabel(item, i === centered)}
            className={itemClassName(i === centered)}
            onClick={() => (i === active ? onActivate?.(i) : onChange(i))}
          >
            {renderItem(item, i === centered)}
          </FlowItem>
        ))}
      </div>
      {dots && (
        <div aria-hidden="true" className="mt-3 flex justify-center gap-1.5">
          {items.map((item, i) => (
            <span
              key={getKey(item)}
              className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
                i === centered ? "w-[22px] bg-bordeaux" : "w-2 bg-bordure"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type FlowItemProps = {
  id: string;
  index: number;
  pos: MotionValue<number>;
  widthVar: string;
  isActive: boolean;
  label: string;
  className: string;
  onClick: () => void;
  children: ReactNode;
};

function FlowItem({ id, index, pos, widthVar, isActive, label, className, onClick, children }: FlowItemProps) {
  const transform = useTransform(pos, (p) => {
    const d = index - p;
    const a = Math.abs(d);
    const side = d < 0 ? -1 : 1;
    const near = Math.min(a, 1);
    // Écart de 0,62 largeur pour la première voisine, puis 0,3 pour les suivantes : elles s'empilent.
    const shift = a <= 1 ? side * 0.62 * a : side * (0.62 + (a - 1) * 0.3);
    return `translateX(-50%) translateX(calc(var(${widthVar}) * ${shift.toFixed(3)})) translateZ(${(-140 * near).toFixed(1)}px) rotateY(${(-side * 52 * near).toFixed(2)}deg)`;
  });
  const zIndex = useTransform(pos, (p) => 50 - Math.round(Math.abs(index - p)));
  const opacity = useTransform(pos, (p) => (Math.abs(index - p) > 5 ? 0 : 1));

  return (
    <motion.div
      id={id}
      role="option"
      aria-selected={isActive}
      aria-label={label}
      onClick={onClick}
      className={`absolute top-2.5 left-1/2 cursor-pointer ${className}`}
      style={{ transform, zIndex, opacity }}
    >
      {children}
    </motion.div>
  );
}
