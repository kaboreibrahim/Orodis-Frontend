// Aperçu 1200 × 630 quand un lien du site est partagé sur WhatsApp ou Facebook, généré au build.
// ImageResponse ne lit pas Tailwind : les couleurs sont relues dans les tokens de app/globals.css,
// pour que la charte reste déclarée à un seul endroit.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Les Délices d’Orodis · Restaurant, pâtisserie et traiteur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TITLE = "Les Délices d’Orodis";
const TAGLINE = "Restaurant · Pâtisserie · Traiteur";
const SUBTITLE = "Spécialités africaines et européennes";

async function brandColors(): Promise<Record<string, string>> {
  const css = await readFile(join(process.cwd(), "app/globals.css"), "utf8");
  return Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{3,8})/gi)].map(([, name, value]) => [name, value]));
}

/** Police de la charte, limitée aux lettres utilisées, depuis Google Fonts ; police par défaut si le réseau manque au build. */
async function googleFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const font = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return font ? await (await fetch(font)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [colors, logo, display, sans] = await Promise.all([
    brandColors(),
    readFile(join(process.cwd(), "public/logo-delices-orodis-blanc-web.png")),
    googleFont("Fraunces:wght@700", TITLE),
    googleFont("DM+Sans:wght@500", TAGLINE + SUBTITLE),
  ]);
  // Chaque texte nomme sa police : sinon la première chargée servirait aussi aux autres lignes.
  const fonts = [
    ...(sans ? [{ name: "DM Sans", data: sans, weight: 500 as const, style: "normal" as const }] : []),
    ...(display ? [{ name: "Fraunces", data: display, weight: 700 as const, style: "normal" as const }] : []),
  ];
  // Jamais fontFamily: undefined dans un style (Satori plante dessus) : la clé n'est posée que si la police est chargée.
  const sansFamily = sans ? "DM Sans" : null;
  const displayStyle = display ? { fontFamily: "Fraunces" } : {};
  const sansStyle = sansFamily ? { fontFamily: sansFamily } : {};

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 88px",
          background: colors.bordeaux,
          color: colors.creme,
        }}
      >
        <img src={`data:image/png;base64,${logo.toString("base64")}`} width={340} height={301} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1 }}>
          <div style={{ ...displayStyle, fontSize: 84, fontWeight: 700, lineHeight: 1, letterSpacing: -2 }}>{TITLE}</div>
          <div style={{ width: 220, height: 10, borderRadius: 10, background: colors.jaune }} />
          <div style={{ ...sansStyle, fontSize: 36, fontWeight: 500, color: colors.jaune }}>{TAGLINE}</div>
          <div style={{ ...sansStyle, fontSize: 30, fontWeight: 500, opacity: 0.85 }}>{SUBTITLE}</div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) },
  );
}
