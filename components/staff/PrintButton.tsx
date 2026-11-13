"use client";

// Bouton « Imprimer » du ticket 80 mm ; ?imprimer=1 ouvre directement la fenêtre d'impression.
// La hauteur de la page imprimée suit celle du ticket : le rouleau thermique est coupé juste après.
import { Printer } from "lucide-react";
import { useEffect } from "react";

const PX_TO_MM = 25.4 / 96;

/** @page à la hauteur exacte du ticket (#ticket), dans la balise <style id="ticket-page"> de la page. */
function fitPageToTicket() {
  const ticket = document.getElementById("ticket");
  const style = document.getElementById("ticket-page");
  if (!ticket || !style) return;
  const height = Math.ceil(ticket.getBoundingClientRect().height * PX_TO_MM) + 2;
  style.textContent = `@page { size: 80mm ${height}mm; margin: 0; }`;
}

export function PrintButton({ auto = false }: { auto?: boolean }) {
  useEffect(() => {
    fitPageToTicket();
    window.addEventListener("beforeprint", fitPageToTicket);
    // Les images (logo, QR) changent la hauteur en se chargeant : on remesure une fois la page chargée.
    window.addEventListener("load", fitPageToTicket);
    const timer = auto ? window.setTimeout(() => (fitPageToTicket(), window.print()), 500) : undefined;
    return () => {
      window.removeEventListener("beforeprint", fitPageToTicket);
      window.removeEventListener("load", fitPageToTicket);
      window.clearTimeout(timer);
    };
  }, [auto]);

  return (
    <button
      type="button"
      onClick={() => {
        fitPageToTicket();
        window.print();
      }}
      className="flex h-12 items-center gap-2 rounded-full bg-bordeaux px-6 font-bold text-white shadow-bouton"
    >
      <Printer size={20} aria-hidden="true" />
      Imprimer le ticket
    </button>
  );
}
