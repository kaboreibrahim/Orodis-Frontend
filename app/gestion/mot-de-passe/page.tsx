// Choix du mot de passe : obligatoire à la première connexion (mot de passe provisoire donné par le gérant),
// accessible ensuite depuis la barre latérale. Page sans barre latérale : la cuisine y passe aussi.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PasswordForm } from "@/components/staff/PasswordForm";
import { homeFor, PASSWORD_PATH, requireStaff } from "@/lib/api/staff";

export const metadata: Metadata = { title: "Mot de passe" };
export const dynamic = "force-dynamic";

export default async function PasswordPage() {
  const user = await requireStaff(undefined, PASSWORD_PATH);
  const forced = user.must_change_password;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-[440px] flex-col gap-6 rounded-[26px] border border-bordure bg-white p-7 shadow-carte">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/logo-delices-orodis-web.png" alt="Les Délices d’Orodis" width={100} height={89} priority />
          <h1 className="text-[28px]">
            {forced ? (
              <>
                Bienvenue, <span className="text-bordeaux italic">{user.name}</span>
              </>
            ) : (
              <>
                Changer mon <span className="text-bordeaux italic">mot de passe</span>
              </>
            )}
          </h1>
          <p className="text-sm text-texte-doux">
            {forced
              ? "Le gérant vous a donné un mot de passe provisoire. Choisissez maintenant le vôtre : vous seul le connaîtrez."
              : "Choisissez un mot de passe que vous êtes seul à connaître."}
          </p>
        </div>
        <PasswordForm forced={forced} />
        {!forced && (
          <Link href={homeFor(user.role)} className="self-center text-sm font-bold text-bordeaux">
            Retour sans changer
          </Link>
        )}
      </div>
    </main>
  );
}
