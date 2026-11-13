// Connexion du personnel : identifiant et mot de passe créés par le gérant dans l'admin Django.
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/staff/LoginForm";
import { getStaffUser, homeFor } from "@/lib/api/staff";

export const metadata: Metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const user = await getStaffUser().catch(() => null);
  if (user) redirect(homeFor(user.role));
  const { suite } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-[420px] flex-col gap-6 rounded-[26px] border border-bordure bg-white p-7 shadow-carte">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/logo-delices-orodis-web.png" alt="Les Délices d’Orodis" width={120} height={106} priority />
          <h1 className="text-[30px]">
            Espace du <span className="text-bordeaux italic">personnel</span>
          </h1>
          <p className="text-sm text-texte-doux">Commandes, cuisine et caisse. Connectez-vous avec le compte donné par le gérant.</p>
        </div>
        <LoginForm suite={suite ?? ""} />
      </div>
    </main>
  );
}
