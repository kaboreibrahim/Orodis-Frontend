// Espace du personnel : jamais indexé. Connexion, gestion (barre latérale) et écran cuisine plein écran.
// Installable comme une application (PWA) : manifeste, icônes, service worker et page hors ligne.
import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { STAFF_MANIFEST, STAFF_THEME_COLOR } from "@/lib/pwa";

export const metadata: Metadata = {
  title: { default: "Espace du personnel", template: "%s · Personnel · Les Délices d'Orodis" },
  robots: { index: false, follow: false },
  manifest: STAFF_MANIFEST,
  applicationName: "Orodis Pro",
  appleWebApp: { capable: true, title: "Orodis Pro", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: STAFF_THEME_COLOR };

export default function StaffRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      {children}
    </>
  );
}
