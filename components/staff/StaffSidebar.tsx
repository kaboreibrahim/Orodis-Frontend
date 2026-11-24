"use client";

// Barre latérale de l'espace du personnel (maquette phase3/Gestion) : fond encre, entrée active en bordeaux.
// Seules les entrées déjà livrées sont affichées (docs/phase3.md, « Côté restaurant »).
// Le fond bordeaux de l'entrée active glisse d'une entrée à l'autre (layoutId).
import { ChefHat, KeyRound, LayoutDashboard, List, type LucideIcon, QrCode, Users, UtensilsCrossed, Wallet } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppControls } from "./AppControls";
import { LogoutButton } from "./LogoutButton";

type NavItem = { label: string; href: string; icon: LucideIcon; roles: readonly string[] };

const NAV: NavItem[] = [
  { label: "Vue d’ensemble", href: "/gestion/tableau-de-bord", icon: LayoutDashboard, roles: ["manager"] },
  { label: "Commandes", href: "/gestion", icon: List, roles: ["manager", "cashier", "waiter"] },
  { label: "Écran cuisine", href: "/gestion/cuisine", icon: ChefHat, roles: ["manager", "cashier", "waiter", "kitchen"] },
  { label: "Carte & menus", href: "/gestion/carte", icon: UtensilsCrossed, roles: ["manager"] },
  { label: "Tables & QR codes", href: "/gestion/tables", icon: QrCode, roles: ["manager"] },
  { label: "Paiements", href: "/gestion/paiements", icon: Wallet, roles: ["manager", "cashier"] },
  { label: "Personnel", href: "/gestion/personnel", icon: Users, roles: ["manager"] },
];

type Props = { name: string; role: string; roleLabel: string };

export function StaffSidebar({ name, role, roleLabel }: Props) {
  const pathname = usePathname();
  return (
    <MotionConfig reducedMotion="user">
    <nav
      aria-label="Navigation du personnel"
      className="flex w-full shrink-0 flex-col gap-1 bg-encre px-3.5 py-5 text-white md:sticky md:top-0 md:h-dvh md:w-[240px]"
    >
      <Image
        src="/logo-delices-orodis-blanc-web.png"
        alt="Les Délices d’Orodis"
        width={150}
        height={133}
        className="mb-5 ml-1.5 h-auto w-[120px] md:w-[150px]"
        priority
      />
      {NAV.filter((item) => item.roles.includes(role)).map(({ label, href, icon: Icon }) => {
        const active = href === "/gestion" ? pathname === "/gestion" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors ${
              active ? "font-bold text-white" : "font-medium text-texte-nav hover:bg-white/5"
            }`}
          >
            {active && (
              <motion.span
                layoutId="entree-active"
                className="absolute inset-0 rounded-xl bg-bordeaux"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
                aria-hidden="true"
              />
            )}
            <Icon size={18} strokeWidth={2} className="relative" aria-hidden="true" />
            <span className="relative">{label}</span>
          </Link>
        );
      })}
      <div className="flex-1" />
      <div className="mt-4">
        <AppControls />
      </div>
      <div className="mt-2 flex items-center gap-2.5 border-t border-bordure-encre px-2 pt-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bordeaux font-bold" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">{name}</div>
          <div className="text-xs text-texte-sur-encre">{roleLabel}</div>
        </div>
        <Link
          href="/gestion/mot-de-passe"
          aria-label="Changer mon mot de passe"
          title="Changer mon mot de passe"
          className="flex size-11 items-center justify-center rounded-full text-texte-nav hover:bg-white/10"
        >
          <KeyRound size={18} aria-hidden="true" />
        </Link>
        <LogoutButton className="flex size-11 items-center justify-center rounded-full text-texte-nav hover:bg-white/10" />
      </div>
    </nav>
    </MotionConfig>
  );
}
