// Espace du personnel : jamais indexé. Connexion, gestion (barre latérale) et écran cuisine plein écran.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Espace du personnel", template: "%s · Personnel · Les Délices d'Orodis" },
  robots: { index: false, follow: false },
};

export default function StaffRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
