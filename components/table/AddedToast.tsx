"use client";

// « Kedjenou de poulet ajouté au panier. » au retour de la fiche (?ajoute=…), puis l'adresse est nettoyée.
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StatusToast } from "./StatusToast";

export function AddedToast({ name }: { name?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(name ? `${name} ajouté au panier.` : null);

  useEffect(() => {
    if (!name) return;
    router.replace(pathname, { scroll: false }); // un rechargement ne réaffiche pas le message
    const timer = window.setTimeout(() => setMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [name, pathname, router]);

  // Au-dessus de la barre du panier
  return <StatusToast message={message} bottom={92} />;
}
