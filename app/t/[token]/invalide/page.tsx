// QR inconnu, régénéré ou table désactivée (ou API momentanément injoignable).
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "QR code non valable", robots: { index: false } };

export default async function InvalidQrPage({ searchParams }: { searchParams: Promise<{ raison?: string }> }) {
  const unavailable = (await searchParams).raison === "indisponible";
  return (
    <main className="mx-auto flex min-h-dvh max-w-[420px] flex-col items-center justify-center gap-5 px-6 text-center">
      <Image src="/logo-delices-orodis-web.png" alt="Les Délices d’Orodis" width={110} height={97} priority />
      <h1 className="text-[30px] leading-tight">
        {unavailable ? (
          <>Un instant, <span className="text-bordeaux italic">s’il vous plaît.</span></>
        ) : (
          <>Ce QR code <span className="text-bordeaux italic">n’est plus valable.</span></>
        )}
      </h1>
      <p className="text-texte-doux">
        {unavailable
          ? "La commande en ligne ne répond pas pour le moment. Réessayez dans une minute, ou demandez au serveur."
          : "Demandez au serveur : il vous indiquera le bon code ou prendra votre commande."}
      </p>
      {unavailable && (
        <a href="./" className="flex min-h-12 items-center rounded-full bg-bordeaux px-7 font-bold text-creme">
          Réessayer
        </a>
      )}
    </main>
  );
}
