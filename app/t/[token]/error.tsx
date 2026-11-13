"use client";

// Erreur d'une page de l'app de table (API qui limite les requêtes ou ne répond pas) : on reste sur la page,
// avec un nouvel essai automatique toutes les 5 s et un bouton « Réessayer ». Jamais d'écran d'erreur technique.
import { RotateCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const RETRY_EVERY = 5;

export default function TableError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [left, setLeft] = useState(RETRY_EVERY);

  function retry() {
    setLeft(RETRY_EVERY);
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLeft((seconds) => {
        if (seconds > 1) return seconds - 1;
        retry();
        return RETRY_EVERY;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- un seul minuteur pour toute la vie de l'écran
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[420px] flex-col items-center justify-center gap-5 px-6 text-center">
      <Image src="/logo-delices-orodis-web.png" alt="Les Délices d’Orodis" width={110} height={97} priority />
      <h1 className="text-[30px] leading-tight">
        Connexion <span className="text-bordeaux italic">difficile.</span>
      </h1>
      <p className="text-texte-doux" role="status">
        {pending ? "Nouvel essai en cours…" : `Nouvel essai dans ${left} s. Votre commande n’est pas perdue.`}
      </p>
      <button
        type="button"
        onClick={retry}
        disabled={pending}
        className="flex min-h-12 items-center gap-2 rounded-full bg-bordeaux px-7 font-bold text-creme disabled:opacity-60"
      >
        <RotateCw size={18} aria-hidden="true" className={pending ? "animate-spin" : undefined} />
        Réessayer
      </button>
    </main>
  );
}
