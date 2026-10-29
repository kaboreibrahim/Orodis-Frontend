import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[720px] flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="text-sm font-bold uppercase tracking-[0.14em] text-bordeaux">Page introuvable</span>
      <h1 className="text-[clamp(34px,4vw,54px)] leading-tight">
        Ce plat n’est <span className="italic text-bordeaux">pas à la carte.</span>
      </h1>
      <p className="text-texte-doux">La page demandée n’existe pas ou a été déplacée.</p>
      <Link
        href="/"
        className="flex min-h-11 items-center rounded-full bg-bordeaux px-7 py-4 font-bold text-creme"
      >
        Retour à l’accueil
      </Link>
    </main>
  );
}
