"use client";

// En-tête : pilule flottante collée en haut, logo, liens d'ancres et boutons ; menu burger sous 820 px.
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BurgerMenu, type MenuContact } from "./BurgerMenu";

const LINKS = [
  { href: "/#carte", label: "La carte", page: "/carte" },
  { href: "/#comment", label: "Comment ça marche" },
  { href: "/#traiteur", label: "Traiteur", page: "/traiteur" },
  { href: "/#acces", label: "Nous trouver", page: "/nous-trouver" },
];

export function Header({ contact }: { contact: MenuContact }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Centre du bouton burger : point de départ du cercle qui révèle le menu.
  const [origin, setOrigin] = useState("calc(100% - 50px) 52px");
  const burgerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  function toggle() {
    const rect = burgerRef.current?.getBoundingClientRect();
    if (rect) setOrigin(`${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`);
    setOpen((value) => !value);
  }

  // Changement de page : le menu se referme.
  useEffect(close, [pathname, close]);

  return (
    <header className="sticky top-0 z-20 px-4 pt-3.5">
      <nav
        aria-label="Navigation principale"
        className={`relative z-10 mx-auto flex max-w-[1200px] items-center justify-between gap-5 rounded-full border py-2 pr-2.5 pl-[18px] backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ${
          open ? "border-transparent bg-transparent shadow-none" : "border-bordure bg-creme/85 shadow-pilule"
        }`}
      >
        <Link href="/" aria-label="Les Délices d’Orodis, accueil" className="flex shrink-0 items-center">
          <Image
            src={open ? "/logo-delices-orodis-blanc-web.png" : "/logo-delices-orodis-web.png"}
            alt=""
            width={56}
            height={50}
            priority
            className="h-[50px] w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-x-[22px] text-[15px] font-medium nav:flex">
          {LINKS.map((link) => {
            const current = link.page !== undefined && pathname.startsWith(link.page);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={`block py-3 transition-colors hover:text-bordeaux ${
                    current ? "font-bold text-bordeaux underline decoration-jaune decoration-2 underline-offset-8" : "text-encre"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden gap-2 nav:flex">
          <Link
            href="/traiteur#devis"
            className="flex h-11 items-center rounded-full border-[1.5px] border-bordeaux px-[18px] text-[15px] font-bold text-bordeaux transition-colors hover:bg-rose"
          >
            Devis traiteur
          </Link>
          <Link
            href="/#reserver"
            className="flex h-11 items-center rounded-full bg-bordeaux px-5 text-[15px] font-bold text-creme transition-opacity hover:opacity-90"
          >
            Réserver
          </Link>
        </div>

        <button
          ref={burgerRef}
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className={`relative size-12 shrink-0 rounded-full transition-colors duration-300 nav:hidden ${
            open ? "bg-jaune focus-visible:outline-creme" : "bg-encre"
          }`}
        >
          <span
            className={`absolute left-[14px] h-0.5 w-5 rounded-full transition-[transform,top,background-color] duration-[450ms] ease-orodis ${
              open ? "top-[23px] rotate-45 bg-encre" : "top-[19px] bg-creme"
            }`}
          />
          <span
            className={`absolute left-[14px] h-0.5 w-5 rounded-full transition-[transform,top,background-color] duration-[450ms] ease-orodis ${
              open ? "top-[23px] -rotate-45 bg-encre" : "top-[27px] bg-creme"
            }`}
          />
        </button>
      </nav>

      {/* Après la nav : l'ordre de tabulation va du bouton burger aux liens du menu. */}
      <BurgerMenu open={open} origin={origin} onClose={close} buttonRef={burgerRef} contact={contact} />
    </header>
  );
}
