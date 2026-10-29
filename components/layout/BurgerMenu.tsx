"use client";

// Menu mobile plein écran : cercle bordeaux qui s'ouvre depuis le bouton burger, liens qui montent un par un.
// Focus piégé tant qu'il est ouvert ; Échap, un lien ou le passage au-dessus de 820 px le referment.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import { formatPhone } from "@/lib/format";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { EASE_IN_OUT, EASE_ORODIS } from "@/components/motion/ease";

export type MenuContact = {
  phone?: string;
  whatsapp?: string;
  /** Horaires résumés, ex. ["Tous les jours, 11:00 – 23:00"]. */
  hours: string[];
};

type BurgerMenuProps = {
  open: boolean;
  /** Centre du cercle, ex. "340px 46px". */
  origin: string;
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  contact: MenuContact;
};

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/#carte", label: "La carte" },
  { href: "/#comment", label: "Comment ça marche" },
  { href: "/traiteur", label: "Traiteur" },
  { href: "/reserver", label: "Réserver" },
  { href: "/#acces", label: "Nous trouver" },
];

const MotionLink = motion.create(Link);

export function BurgerMenu({ open, origin, onClose, buttonRef, contact }: BurgerMenuProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const button = buttonRef.current;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });

    // Le bouton burger (qui ferme le menu) fait partie du piège à focus.
    const focusables = () =>
      [button, ...(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [])].filter(
        (el): el is HTMLElement => el !== null,
      );

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        button?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !list.includes(active)) {
        e.preventDefault();
        first?.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    const desktop = window.matchMedia("(min-width: 51.25rem)");
    const onResize = () => desktop.matches && onClose();

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, buttonRef]);

  const instant = { duration: 0 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-0 overflow-y-auto bg-bordeaux text-creme nav:hidden"
          initial={reduce ? false : { clipPath: `circle(0% at ${origin})` }}
          animate={{
            clipPath: `circle(150% at ${origin})`,
            transition: reduce ? instant : { duration: 0.9, ease: EASE_IN_OUT },
          }}
          exit={{
            clipPath: `circle(0% at ${origin})`,
            transition: reduce ? instant : { duration: 0.55, ease: EASE_IN_OUT, delay: 0.1 },
          }}
        >
          <div className="flex min-h-full flex-col gap-[34px] px-7 pt-[110px] pb-9">
            <ol className="flex flex-col gap-1.5">
              {LINKS.map((link, i) => (
                <li key={link.href} className="overflow-hidden pb-1">
                  <MotionLink
                    href={link.href}
                    onClick={onClose}
                    className="flex items-baseline gap-3 py-1 font-display text-[40px] leading-[1.15] font-bold tracking-[-0.02em] text-creme focus-visible:outline-jaune"
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: 0, transition: reduce ? instant : { duration: 0.8, ease: EASE_ORODIS, delay: 0.15 + i * 0.06 } }}
                    exit={{ y: "110%", transition: reduce ? instant : { duration: 0.3, ease: EASE_IN_OUT } }}
                  >
                    <span className="min-w-[26px] font-sans text-[13px] font-bold text-jaune">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{link.label}</span>
                  </MotionLink>
                </li>
              ))}
            </ol>

            <motion.div
              className="flex flex-col gap-2"
              initial={reduce ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0, transition: reduce ? instant : { duration: 0.6, ease: EASE_ORODIS, delay: 0.5 } }}
              exit={{ opacity: 0, transition: reduce ? instant : { duration: 0.2 } }}
            >
              {contact.hours.map((line) => (
                <span key={line} className="text-xs font-bold tracking-[0.14em] text-jaune uppercase">
                  {line}
                </span>
              ))}
              {contact.whatsapp && (
                <a href={whatsappLink(contact.whatsapp)} className="py-1 text-[17px] text-creme focus-visible:outline-jaune">
                  WhatsApp {formatPhone(contact.whatsapp)}
                </a>
              )}
              {contact.phone && (
                <a href={telLink(contact.phone)} className="py-1 text-[17px] text-creme focus-visible:outline-jaune">
                  Tél. {formatPhone(contact.phone)}
                </a>
              )}
              <Link
                href="/reserver"
                onClick={onClose}
                className="mt-3.5 flex h-14 items-center justify-center rounded-full bg-jaune text-[17px] font-bold text-encre focus-visible:outline-creme"
              >
                Réserver une table
              </Link>
              <Link
                href="/traiteur#devis"
                onClick={onClose}
                className="flex h-14 items-center justify-center rounded-full border-[1.5px] border-creme text-[17px] font-bold text-creme focus-visible:outline-jaune"
              >
                Demander un devis
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
