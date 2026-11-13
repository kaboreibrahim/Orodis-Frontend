// Mentions légales : éditeur, hébergeur, données personnelles.
// Les mentions entre crochets restent à compléter avec le client avant la mise en ligne.
import type { Metadata } from "next";
import { getSettings } from "@/lib/api/settings";
import { formatPhone } from "@/lib/format";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergeur et protection des données personnelles du site Les Délices d’Orodis.",
  robots: { index: false },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[26px]">{title}</h2>
      <div className="flex flex-col gap-3 text-texte-doux">{children}</div>
    </section>
  );
}

export default async function MentionsLegalesPage() {
  const settings = await getSettings();
  const name = settings.name ?? "Les Délices d’Orodis";

  return (
    <main className="mx-auto flex max-w-[760px] flex-col gap-10 px-6 pt-12 pb-24">
      <h1 className="text-[clamp(34px,4.4vw,54px)] leading-[1.04]">Mentions légales</h1>

      <Section title="Éditeur du site">
        <p>
          {name}, restaurant, pâtisserie et traiteur.
          <br />
          {settings.address || "[Adresse du restaurant]"}, Côte d’Ivoire.
        </p>
        <p>
          RCCM : [à compléter] · NCC : [à compléter]
          <br />
          Directeur de la publication : [nom du gérant]
        </p>
        <p>
          {settings.phone && <>Téléphone : {formatPhone(settings.phone)}<br /></>}
          {settings.email && <>E-mail : {settings.email}</>}
        </p>
      </Section>

      <Section title="Hébergement">
        <p>[Nom de l’hébergeur du serveur, adresse et site web à compléter.]</p>
      </Section>

      <Section title="Données personnelles">
        <p>
          Les formulaires de réservation et de demande de devis recueillent votre nom, votre numéro de téléphone ou
          WhatsApp, et le cas échéant votre e-mail et les précisions que vous donnez. Ces informations servent
          uniquement à traiter votre demande et à vous recontacter ; elles ne sont ni vendues ni cédées.
        </p>
        <p>Elles sont conservées [durée à préciser] puis supprimées.</p>
        <p>
          Conformément à la loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la protection des données à
          caractère personnel, vous pouvez demander l’accès à vos données, leur rectification ou leur suppression en
          écrivant {settings.email ? `à ${settings.email}` : "au restaurant"}. Vous pouvez aussi saisir l’ARTCI.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Le site n’utilise ni cookie publicitaire ni outil de mesure d’audience. Il garde seulement, le temps de
          votre visite, l’information que l’écran de bienvenue a déjà été affiché.
        </p>
      </Section>
    </main>
  );
}
