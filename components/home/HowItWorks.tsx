"use client";

// « Comment ça marche » : les 4 étapes défilent, le téléphone reste collé (position: sticky)
// et change d'écran selon l'étape au milieu de l'écran (useScroll). Le parent est en overflow: clip.
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { DishImage } from "@/components/menu/DishImage";
import type { Dish } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";

const STEPS = [
  { title: "Scannez.", text: "Le QR code posé sur votre table ouvre la carte sur votre téléphone. Aucune application à installer." },
  { title: "Choisissez.", text: "Plats africains, européens, pâtisseries, boissons : parcourez la carte, précisez vos envies." },
  { title: "Commandez.", text: "Un geste, et la commande part directement en cuisine. Payez tout de suite ou à la fin du repas." },
  { title: "Savourez.", text: "Suivez la préparation en direct. Le serveur vous apporte votre plat, bien chaud." },
];

// QR code décoratif 13 × 13 : trois repères dans les coins, motif régulier ailleurs.
const QR = Array.from({ length: 169 }, (_, n) => {
  const x = n % 13;
  const y = Math.floor(n / 13);
  const corner = (x < 4 && y < 4) || (x > 8 && y < 4) || (x < 4 && y > 8);
  if (!corner) return (x * 7 + y * 13 + x * y) % 3 === 0;
  const cx = x > 8 ? x - 9 : x;
  const cy = y > 8 ? y - 9 : y;
  if (cx === 3 || cy === 3) return false;
  return cx === 0 || cy === 0 || ((cx === 1 || cx === 2) && (cy === 1 || cy === 2));
});

export function HowItWorks({ dishes }: { dishes: Dish[] }) {
  const stepsRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  // 0 quand la première étape passe au milieu de l'écran, 1 pour la dernière.
  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ["start 55%", "end 55%"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => setStep(Math.min(3, Math.max(0, Math.floor(p * 4)))));

  return (
    <section id="comment" className="mt-[110px] bg-encre text-creme">
      <div className="mx-auto max-w-[1200px] px-6 pt-24 pb-10">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          <span className="text-[13px] font-bold tracking-[0.14em] text-jaune uppercase">Comment ça marche</span>
          <h2 className="text-[clamp(36px,4.4vw,60px)] leading-[1.02]">
            Commander à table, <span className="text-jaune italic">en 4 gestes.</span>
          </h2>
          <span className="self-start rounded-full border border-creme/25 px-3.5 py-1.5 text-sm font-bold text-texte-sur-encre">
            Bientôt disponible au restaurant
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 nav:grid-cols-[minmax(0,1fr)_auto] nav:gap-x-14">
          {/* Marge basse : le téléphone reste collé jusqu'au bout de la dernière étape. */}
          <div ref={stepsRef} className="col-start-1 row-start-1 pt-[380px] nav:pt-0 nav:pb-24">
            {STEPS.map((s, i) => (
              <article
                key={s.title}
                aria-current={i === step ? "step" : undefined}
                // Mobile : texte en bas de l'étape, pour qu'il soit lisible sous le téléphone collé en haut.
                className={`flex min-h-[460px] flex-col justify-end gap-4 pb-8 transition-[opacity,transform] duration-500 ease-orodis nav:min-h-[520px] nav:justify-center nav:pb-0 ${
                  i === step ? "opacity-100" : "-translate-x-1.5 opacity-[0.28]"
                }`}
              >
                <span className="text-[15px] font-bold tracking-[0.06em] text-jaune">Étape 0{i + 1}</span>
                <h3 className="text-[clamp(48px,6.4vw,92px)] leading-[0.95] tracking-[-0.03em]">{s.title}</h3>
                <p className="max-w-[440px] text-[clamp(17px,1.5vw,20px)] text-texte-sur-encre">{s.text}</p>
              </article>
            ))}
          </div>

          <div aria-hidden="true" className="pointer-events-none z-[2] col-start-1 row-start-1 nav:pointer-events-auto nav:col-start-2">
            <div className="sticky top-[92px] flex h-[360px] items-start justify-center bg-[linear-gradient(var(--color-encre)_82%,transparent)] nav:top-[110px] nav:h-auto nav:items-center nav:gap-14 nav:bg-none nav:py-5">
              <ProgressLine progress={scrollYProgress} step={step} />
              <Phone step={step} dishes={dishes} />
            </div>
          </div>
        </div>

        <p className="mt-10 text-[15px] text-texte-sur-encre">
          En attendant, commandez sur place, par téléphone ou sur WhatsApp : la même carte, les mêmes plats.
        </p>
      </div>
    </section>
  );
}

function ProgressLine({ progress, step }: { progress: ReturnType<typeof useScroll>["scrollYProgress"]; step: number }) {
  return (
    <div className="relative hidden h-[480px] w-3.5 shrink-0 nav:block">
      <div className="absolute inset-y-0 left-1.5 w-0.5 bg-creme/15" />
      <motion.div className="absolute inset-y-0 left-1.5 w-0.5 origin-top bg-jaune" style={{ scaleY: progress }} />
      {STEPS.map((s, i) => (
        <span
          key={s.title}
          className={`absolute left-0 size-3.5 rounded-full transition-[background-color,transform] duration-300 ${
            step >= i ? "bg-jaune" : "border-2 border-creme/30 bg-encre"
          } ${step === i ? "scale-[1.35]" : ""}`}
          style={{ top: `calc(${(i / 3) * 100}% - 7px)` }}
        />
      ))}
    </div>
  );
}

function Screen({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 transition-[opacity,transform,filter] duration-500 ease-orodis ${
        on ? "opacity-100" : "pointer-events-none scale-[0.97] opacity-0 blur-[6px]"
      }`}
    >
      {children}
    </div>
  );
}

function Phone({ step, dishes }: { step: number; dishes: Dish[] }) {
  const order = dishes.slice(0, 2);
  const total = order.reduce((sum, dish) => sum + dish.price, 0);

  return (
    <div className="relative h-[620px] w-[300px] shrink-0 origin-top scale-[0.55] nav:scale-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] font-display text-[380px] leading-none font-bold tracking-[-0.05em] text-jaune/7">
        0{step + 1}
      </div>
      <div className="absolute inset-0 rounded-[48px] bg-encre p-[11px] shadow-relief ring-1 ring-creme/10">
        <div className="relative size-full overflow-hidden rounded-[38px] bg-creme text-encre">
          <div className="absolute top-2.5 left-1/2 z-[5] h-[26px] w-[90px] -translate-x-1/2 rounded-[14px] bg-encre" />

          <Screen on={step === 0}>
            <div className="flex flex-col items-center gap-4 px-[22px] pt-[60px] text-center">
              <Image src="/logo-delices-orodis-web.png" alt="" width={72} height={64} className="h-16 w-auto" />
              <div className="font-display text-[22px] font-bold">Table 5</div>
              <div className="grid size-[190px] grid-cols-13 gap-0.5 rounded-[18px] bg-white p-3 shadow-carte">
                {QR.map((on, n) => (
                  <div key={n} className={`aspect-square rounded-[1px] ${on ? "bg-encre" : ""}`} />
                ))}
              </div>
              <div className="text-sm text-texte-doux">Scannez avec l’appareil photo de votre téléphone</div>
            </div>
          </Screen>

          <Screen on={step === 1}>
            <div className="flex flex-col gap-2.5 px-4 pt-[50px]">
              <div className="font-display text-[22px] font-bold">La carte</div>
              {dishes.slice(0, 3).map((dish, i) => (
                <div key={dish.id} className="overflow-hidden rounded-2xl bg-white">
                  {i === 0 && (
                    <div className="relative h-[110px]">
                      <DishImage dish={dish} sizes="280px" initialClassName="text-5xl" />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-bold">{dish.name}</div>
                      <div className="text-xs text-texte-doux">{formatPrice(dish.price)}</div>
                    </div>
                    <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-bordeaux font-bold text-creme">+</div>
                  </div>
                </div>
              ))}
            </div>
          </Screen>

          <Screen on={step === 2}>
            <div className="flex h-full flex-col gap-3 px-[18px] pt-[50px] pb-[18px]">
              <div className="font-display text-[22px] font-bold">Ma commande</div>
              <div className="-mt-2 text-[13px] text-texte-doux">Table 5 · sur place</div>
              {order.map((dish) => (
                <div key={dish.id} className="flex justify-between gap-2 border-b border-bordure py-2 text-[15px]">
                  <span className="truncate">1× {dish.name}</span>
                  <span className="shrink-0 font-bold">{formatPrice(dish.price)}</span>
                </div>
              ))}
              <div className="flex-1" />
              <div className="flex justify-between font-display text-xl font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex h-[52px] items-center justify-center rounded-full bg-bordeaux font-bold text-creme">Envoyer en cuisine</div>
              <div className="mb-3.5 text-center text-xs text-texte-doux">Payez maintenant ou à la fin du repas</div>
            </div>
          </Screen>

          <Screen on={step === 3}>
            <div className="flex flex-col gap-4 px-5 pt-14">
              <div className="font-display text-[22px] font-bold">Suivi en direct</div>
              {["Commande reçue", "En préparation", "Servie à votre table"].map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className={`flex size-[30px] items-center justify-center rounded-full text-sm font-bold text-creme ${
                      i < 2 ? "bg-whatsapp" : "bg-bordeaux"
                    }`}
                  >
                    {i < 2 ? "✓" : "3"}
                  </span>
                  <span className="font-bold">{label}</span>
                </div>
              ))}
              <div className="mt-3 rounded-[22px] bg-bordeaux px-5 py-[26px] text-center text-creme">
                <div className="font-display text-[30px] font-bold italic">Bon appétit !</div>
                <div className="mt-1.5 text-[13px] text-rose">Le serveur arrive avec votre plat.</div>
              </div>
            </div>
          </Screen>
        </div>
      </div>
    </div>
  );
}
