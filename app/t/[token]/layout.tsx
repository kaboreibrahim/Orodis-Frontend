// App de table (QR) : plein écran, sans l'en-tête du site ; jamais indexée.
import type { Metadata } from "next";
import { SoundProvider } from "@/components/table/SoundProvider";

export const metadata: Metadata = {
  title: "Commander à table",
  robots: { index: false, follow: false },
};

export default function TableLayout({ children }: { children: React.ReactNode }) {
  return <SoundProvider>{children}</SoundProvider>;
}
