# Architecture du site vitrine Next.js — Les Délices d'Orodis

29 octobre 2026 · @ibrahim

## Vue d'ensemble

Le site vitrine est un projet Next.js séparé (dépôt `Orodis-frontend`) qui lit la carte et les réglages dans l'API Django et lui envoie réservations et devis. Les pages sont rendues côté serveur et régénérées toutes les 10 minutes : le site reste rapide sur mobile, même avec une connexion 3G, et une modification du gérant apparaît vite.

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript strict | Rendu serveur, référencement, images optimisées |
| Style | Tailwind CSS v4 | Tokens de la charte dans un seul fichier CSS |
| Animations | Motion (`motion/react`) | Le même moteur que Framer Motion, utilisé par woudys.com |
| Polices | `next/font/google` : Fraunces et DM Sans | Chargées localement, sans décalage d'affichage |
| Formulaires | React Hook Form + Zod | Validation côté navigateur, mêmes règles que l'API |
| Envoi des formulaires | Server Actions Next.js | L'URL de l'API reste côté serveur, pas de problème CORS |
| Icônes | lucide-react | Légères, cohérentes avec la maquette |
| Hébergement | Coolify, sortie `standalone` | Même VPS que l'API |

Le site n'a ni compte client ni panier : la commande à table par QR arrivera en phase 3 dans le même projet, sous la route `/t/[token]`.

## Arborescence

Les composants sont rangés par section de la page d'accueil, et les animations réutilisables dans `components/motion/`. Tout ce qui parle à l'API passe par `lib/api/`.

```
frontend/
├── app/
│   ├── layout.tsx              # polices, métadonnées, en-tête, pied de page
│   ├── page.tsx                # accueil (toutes les sections)
│   ├── carte/page.tsx          # carte complète
│   ├── carte/[slug]/page.tsx   # fiche d'un plat
│   ├── reserver/page.tsx       # réservation en 3 étapes
│   ├── traiteur/page.tsx       # événements + formulaire de devis
│   ├── nous-trouver/page.tsx   # carte Google Maps, horaires, contacts
│   ├── mentions-legales/page.tsx
│   ├── actions/
│   │   ├── reservation.ts      # Server Action → POST /reservations/
│   │   └── quote.ts            # Server Action → POST /catering/quotes/
│   ├── api/revalidate/route.ts # appelé par Django pour rafraîchir la carte
│   ├── sitemap.ts, robots.ts
│   ├── opengraph-image.tsx     # aperçu WhatsApp / Facebook
│   └── not-found.tsx
├── components/
│   ├── layout/                 # Header, BurgerMenu, Footer
│   ├── home/                   # Intro, Hero, Marquees, Bento, HowItWorks, CateringTeaser, Stats, ReserveCta, Faq, Location
│   ├── menu/                   # CategoryRing, CoverFlow, DishCard, DishSheet
│   ├── reservation/            # ReservationWizard, DatePicker, SlotGrid, PartySize
│   ├── catering/               # EventGrid, Formulas, QuoteForm
│   ├── motion/                 # RiseText, DrawUnderline, FadeUp, Marquee, PingDot, useSwipe
│   └── ui/                     # Button, Chip, Input, Stepper, Toast
├── lib/
│   ├── api/
│   │   ├── client.ts           # fetch typé, URL de l'API, gestion d'erreur
│   │   ├── menu.ts, settings.ts
│   │   └── types.ts            # types de la carte, des réglages, des réponses
│   ├── schemas.ts              # schémas Zod réservation et devis
│   ├── format.ts               # prix "4 500 F", dates en français
│   └── whatsapp.ts             # liens wa.me
├── public/                     # logo, logo blanc, favicon, photos par défaut
├── docs/
│   ├── architecture.md         # ce document
│   └── maquettes/              # fichiers HTML des maquettes validées
├── CLAUDE.md
├── Dockerfile
├── next.config.ts              # output: "standalone", domaines d'images
└── .env.example
```

## Pages et routes

Sept pages publiques, chacune fidèle à une maquette validée. L'accueil reprend toutes les sections ; les autres pages approfondissent une section.

| Route | Contenu | Données API | Rendu |
|---|---|---|---|
| `/` | Écran de bienvenue, héros, bandeaux, bento, aperçu de la carte (anneau + CouvertureFlow), « Comment ça marche » en défilement collé, traiteur, chiffres, réservation, FAQ, Nous trouver, appel final | `/settings/`, `/menu/`, `/menu/featured/` | Statique, régénéré toutes les 10 min |
| `/carte` | Carte complète : anneau des catégories, CouvertureFlow des sous-catégories et des plats | `/menu/` | Statique, 10 min |
| `/carte/[slug]` | Fiche d'un plat : photo, description, prix, options | `/menu/dishes/{slug}/` | Statique par plat (`generateStaticParams`) |
| `/reserver` | Réservation en 3 étapes : date et couverts, créneau, coordonnées, puis confirmation | `/reservations/availability/`, `POST /reservations/` | Page statique, créneaux lus en direct |
| `/traiteur` | Événements, formules, déroulé, formulaire de devis | `/settings/`, `POST /catering/quotes/` | Statique |
| `/nous-trouver` | Carte Google Maps (iframe), adresse, horaires, téléphone, WhatsApp | `/settings/` | Statique, 10 min |
| `/mentions-legales` | Éditeur, hébergeur, données personnelles | `/settings/` | Statique |

Les ancres de l'accueil (`#carte`, `#comment`, `#traiteur`, `#reserver`, `#acces`) restent dans le menu ; sur mobile, les boutons « Réserver » et « Devis » mènent aux pages dédiées, plus confortables à remplir.

## Charte : couleurs, typographies, tokens

Le bordeaux et le jaune du logo portent toute l'identité ; le reste est crème et encre. Ces valeurs sont celles des maquettes validées, à déclarer une seule fois dans `app/globals.css`.

| Token | Valeur | Usage |
|---|---|---|
| `--color-bordeaux` | #810C1B | Boutons principaux, titres en italique, accents |
| `--color-jaune` | #EBE320 | Soulignements dessinés, chiffres, badges sur fond sombre |
| `--color-creme` | #FBF5EE | Fond de page |
| `--color-sable` | #F5ECE4 | Cartes d'étapes, fonds secondaires |
| `--color-rose` | #F4E3E1 | Pastilles d'icônes |
| `--color-encre` | #241014 | Texte, pied de page, blocs sombres |
| `--color-texte-doux` | #5A4549 | Paragraphes secondaires |
| `--color-bordure` | #EADBD3 | Bordures de cartes et de champs |
| `--color-whatsapp` | #1F9D55 | Boutons WhatsApp, confirmations |

```css
@import "tailwindcss";

@theme {
  --color-bordeaux: #810C1B;
  --color-jaune: #EBE320;
  --color-creme: #FBF5EE;
  --color-sable: #F5ECE4;
  --color-rose: #F4E3E1;
  --color-encre: #241014;
  --color-texte-doux: #5A4549;
  --color-bordure: #EADBD3;
  --color-whatsapp: #1F9D55;
  --font-display: var(--font-fraunces), Georgia, serif;
  --font-sans: var(--font-dm-sans), system-ui, sans-serif;
  --ease-orodis: cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Typographies**

- Fraunces 600 et 700, romain et italique : titres. Le mot fort de chaque titre est en italique bordeaux (« Vos grands moments, *notre savoir-faire.* »).
- DM Sans 400, 500 et 700 : texte, boutons, formulaires. Corps de texte à 16 px minimum sur mobile.
- Titres fluides avec `clamp()`, par exemple `clamp(42px, 5.6vw, 76px)` pour le h1.

**Formes** : boutons en pilule (`rounded-full`), cartes arrondies 22 à 26 px, champs de 48 px de haut, zones cliquables de 44 px minimum.

## Animations

Chaque animation de la maquette devient un composant Motion réutilisable, avec les mêmes durées et la même courbe `cubic-bezier(0.16, 1, 0.3, 1)`. Toutes respectent `prefers-reduced-motion` : si le visiteur a réduit les animations, le contenu s'affiche directement.

| Animation | Où | Réalisation Motion | Réglages de la maquette |
|---|---|---|---|
| Écran de bienvenue | Accueil, première visite | `Intro` : logo qui apparaît (`scale` 0 → 1, ressort), nom du restaurant ligne par ligne, puis cercle qui se referme (`clip-path: circle()`) et `AnimatePresence` pour le retirer | 3 s en tout ; affiché une fois par session (`sessionStorage`) |
| Texte qui monte ligne par ligne | Titres | `RiseText` : chaque ligne dans un conteneur `overflow: hidden`, `y: "110%"` → 0 | 0,85 s, décalage de 0,15 s par ligne |
| Soulignement dessiné | Mot fort du héros | `DrawUnderline` : `motion.path` avec `pathLength` 0 → 1 | 0,9 s, après le titre |
| Apparition au défilement | Sections, cartes | `FadeUp` : `whileInView`, `viewport={{ once: true, amount: 0.3 }}`, `y: 24 → 0` | 0,7 s |
| Bandeaux croisés | Sous le héros | `Marquee` : piste dupliquée, `animate={{ x: ["0%", "-50%"] }}` en boucle, l'un à l'envers et légèrement incliné | 38 s et 46 s, linéaire |
| Point qui pulse | Badge « Ouvert » | `PingDot` : halo `scale` 1 → 2,4 et `opacity` 0,6 → 0 | 1,8 s en boucle |
| Anneau des catégories | Carte | `CategoryRing` : chaque catégorie placée par `rotate(i × Δ) translateY(-R)`, l'anneau tourne avec `useSpring` vers la catégorie choisie | Glisser au doigt, pas de flèches |
| CouvertureFlow | Sous-catégories et plats | `CoverFlow` : position fractionnaire `useMotionValue`, chaque carte calcule `rotateY`, `translateZ`, `scale` et `opacity` selon son écart au centre, `perspective: 1000px` | Glisser au doigt, points indicateurs, clic ignoré après un glissement |
| « Comment ça marche » collé | Accueil | `HowItWorks` : section haute de 4 écrans, téléphone en `position: sticky`, `useScroll` + `useTransform` pour changer l'étape affichée | 4 étapes ; parent en `overflow: clip`, jamais `hidden` |
| Menu burger | Mobile, moins de 820 px | `BurgerMenu` : `clip-path: circle(0 at <bouton>)` → `circle(150% at <bouton>)`, liens qui montent un par un | 0,9 s ; ferme au clic sur un lien et avec Échap |

Le glissement (anneau, CouvertureFlow) passe par un seul hook `useSwipe` basé sur les événements `pointer` : il gère la souris et le doigt, et un seuil de 6 px distingue un clic d'un glissement.

Les composants animés sont des composants client (`"use client"`) ; les sections qui les contiennent restent des composants serveur qui leur passent les données.

## Données et formulaires

Le navigateur du visiteur ne parle jamais directement à Django : les pages lisent l'API côté serveur, et les formulaires passent par des Server Actions. Seules les disponibilités de réservation sont lues en direct, via une route Next.js intermédiaire.

### Lecture de l'API

- `lib/api/client.ts` : une fonction `api<T>(chemin, options)` qui préfixe `API_URL`, ajoute `next: { revalidate: 600, tags: ["menu"] }` par défaut et lève une erreur claire si l'API ne répond pas.
- Types générés depuis le Swagger du backend : `npx openapi-typescript $API_URL/api/schema/ -o lib/api/schema.d.ts`, relancé à chaque changement d'API. Aucun type de réponse écrit à la main.
- Si l'API est indisponible au moment de la régénération, Next.js garde la dernière version de la page : le site ne tombe pas avec l'API.
- Photos des plats : `next/image` avec `remotePatterns` sur le domaine de l'API ; un plat sans photo affiche une illustration par défaut de `public/`.

### Rafraîchissement immédiat de la carte

Quand le gérant modifie la carte, le signal Django qui vide déjà le cache Redis appelle aussi `POST https://<site>/api/revalidate` avec l'en-tête `x-revalidate-secret`. La route exécute `revalidateTag("menu")`. C'est un ajout de quelques lignes côté backend (variables `FRONTEND_REVALIDATE_URL` et `REVALIDATE_SECRET`).

### Réservation

1. Étape 1 : date (aujourd'hui à J+60) et nombre de personnes.
2. Étape 2 : créneaux lus par `GET /api/availability?date=&party=` (route Next.js qui relaie l'API, sans cache) ; les créneaux complets sont grisés.
3. Étape 3 : nom, téléphone, note facultative, puis envoi par la Server Action `createReservation`.
4. Confirmation : référence de la réservation et message « Le restaurant vous confirme par WhatsApp ».

### Devis traiteur

La Server Action `createQuote` envoie la demande, puis l'écran de confirmation propose le lien WhatsApp pré-rempli renvoyé par l'API.

### Règles communes aux formulaires

- Schémas Zod dans `lib/schemas.ts`, utilisés à la fois par React Hook Form et par la Server Action (double validation).
- Numéro ivoirien à 10 chiffres, accepté avec ou sans espaces et avec ou sans +225.
- Champ piège caché (`website`) : s'il est rempli, la Server Action répond « envoyé » sans rien transmettre.
- Les erreurs de l'API (`{"champ": ["message"]}`) sont affichées sous le champ concerné ; une erreur réseau affiche le bouton WhatsApp en solution de secours.
- Bouton désactivé pendant l'envoi pour éviter les doublons.

**Point d'attention, limite d'envois par IP.** Avec les Server Actions, toutes les réservations arrivent à Django depuis l'IP du serveur Next.js : la limite de 5 par heure et par IP bloquerait tout le monde. La Server Action transmet donc l'IP du visiteur dans `X-Forwarded-For`, et le backend doit régler, après test sur le serveur, `NUM_PROXIES` de DRF pour la lire.

### Variables d'environnement (.env.example)

```
API_URL=https://api.delicesdorodis.ci/api/v1
NEXT_PUBLIC_SITE_URL=https://delicesdorodis.ci
REVALIDATE_SECRET=
NEXT_PUBLIC_WHATSAPP=2250702578159
NEXT_PUBLIC_GOOGLE_MAPS_EMBED=
```

Les domaines sont des exemples, comme dans l'architecture du backend.

## Référencement, performance et déploiement

L'objectif est un site qui s'ouvre en moins de 3 secondes sur un téléphone moyen en 3G, et qui sort sur Google pour « restaurant » + le nom de la commune.

### Référencement

- `metadata` par page (titre, description) et `metadataBase` = `NEXT_PUBLIC_SITE_URL`.
- `opengraph-image.tsx` : image 1200 × 630 aux couleurs du restaurant, pour un bel aperçu quand le lien est partagé sur WhatsApp ou Facebook.
- Données structurées JSON-LD `Restaurant` dans le layout : nom, adresse, téléphone, horaires, `servesCuisine`, `acceptsReservations`, lien vers la carte.
- `sitemap.ts` (toutes les pages + chaque plat) et `robots.ts`.
- Fiche Google Business du restaurant reliée au site. [À créer ou récupérer avec le client.]
- `lang="fr"` sur `<html>`.

### Performance

- Photos via `next/image`, format AVIF/WebP, `sizes` renseigné ; seule la photo du héros est en `priority`.
- Motion importé seulement dans les composants client qui l'utilisent ; l'iframe Google Maps chargée en `loading="lazy"`.
- Objectif Lighthouse mobile : 90 en performance, 100 en accessibilité et référencement.

### Accessibilité

- Contraste vérifié : texte crème sur bordeaux et encre sur jaune passent ; jaune sur crème est réservé aux décors.
- Anneau et CouvertureFlow utilisables au clavier (flèches gauche et droite) et lisibles par un lecteur d'écran (`role="listbox"`, `aria-selected`).
- Menu burger : focus piégé tant qu'il est ouvert, fermeture avec Échap.

### Déploiement Coolify

- `next.config.ts` : `output: "standalone"`.
- Dockerfile en 3 étapes (dépendances, build, exécution sur `node:22-alpine`), port 3000.
- Application « orodis-web » dans Coolify, sur le même VPS que l'API, domaine principal + `www` redirigé.
- Les variables `API_URL` et `REVALIDATE_SECRET` sont saisies dans Coolify ; `API_URL` doit être disponible au build, car les pages statiques lisent l'API à ce moment-là.

## Étapes de développement

Huit étapes, à donner une par une à Claude Code. Les étapes 1 à 5 ne dépendent que de la carte, déjà servie par le backend ; la réservation (étape 7) attend l'app `reservations` du backend, et le devis (étape 6) attend l'app `catering`.

| Étape | Contenu | Dépend du backend |
|---|---|---|
| 1 | Projet, charte, polices, CLAUDE.md, Docker | Non |
| 2 | En-tête, menu burger, pied de page, composants d'animation | `/settings/` |
| 3 | Accueil : bienvenue, héros, bandeaux, bento | `/menu/featured/` |
| 4 | Carte : anneau, CouvertureFlow, fiche plat | `/menu/` |
| 5 | Accueil : « Comment ça marche », chiffres, FAQ, Nous trouver | `/settings/` |
| 6 | Page Traiteur et formulaire de devis | App `catering` |
| 7 | Réservation en 3 étapes | App `reservations` |
| 8 | Référencement, rafraîchissement, déploiement | Route de revalidation |

Avant l'étape 1, place ce document dans `docs/architecture.md` et les fichiers HTML des maquettes dans `docs/maquettes/` : Claude Code s'y réfère pour la mise en page et les animations.

### Étape 1 — Initialisation

```
Crée un projet Next.js 15 (App Router, TypeScript strict, Tailwind CSS v4,
ESLint, dossier app/ à la racine, alias @/*).
Déclare les tokens de la section « Charte » de docs/architecture.md dans
app/globals.css (@theme), charge Fraunces (600, 700, romain et italique) et
DM Sans (400, 500, 700) avec next/font/google.
Installe motion, lucide-react, react-hook-form, zod, @hookform/resolvers.
Crée l'arborescence de la section « Arborescence » (fichiers vides avec un
commentaire), lib/format.ts (prix "4 500 F" avec espace insécable, dates en
français), next.config.ts en output standalone, le Dockerfile en 3 étapes et
.env.example.
Écris un CLAUDE.md avec les règles : lire docs/architecture.md avant chaque
étape, s'inspirer de docs/maquettes/, textes en français, composants serveur
par défaut et "use client" seulement pour l'interactif, aucune couleur en dur
hors des tokens, prefers-reduced-motion respecté partout.
```

### Étape 2 — Structure et animations de base

```
Réalise lib/api/client.ts et lib/api/settings.ts (revalidate 600), puis
génère les types avec openapi-typescript depuis $API_URL/api/schema/.
Crée components/motion/ : RiseText, DrawUnderline, FadeUp, Marquee, PingDot
et le hook useSwipe, avec les durées du tableau « Animations ».
Crée Header (pilule flottante, logo, liens d'ancres, bouton Réserver),
BurgerMenu (sous 820 px, ouverture en cercle depuis le bouton, focus piégé,
Échap) et Footer (coordonnées lues dans /settings/), selon
docs/maquettes/Main.dc.html.
```

### Étape 3 — Accueil, première partie

```
Réalise components/home/Intro (logo, nom ligne par ligne, cercle qui se
referme, une fois par session), Hero (titre RiseText, soulignement dessiné,
badge Ouvert avec PingDot, photo), Marquees (deux bandeaux croisés) et Bento
(plats de /menu/featured/), fidèles à docs/maquettes/Main.dc.html.
Vérifie le rendu à 390 px et 1440 px de large.
```

### Étape 4 — La carte

```
Réalise lib/api/menu.ts (tag "menu"), puis components/menu/CategoryRing et
CoverFlow selon docs/maquettes/Carte.dc.html : glissement au doigt avec
useSwipe, aucune flèche, points indicateurs, clic ignoré après un glissement,
navigation au clavier et attributs ARIA.
Utilise-les sur la page /carte et dans la section #carte de l'accueil.
Crée /carte/[slug] avec generateStaticParams et la fiche du plat (photo ou
illustration par défaut, prix, options).
```

### Étape 5 — Accueil, seconde partie

```
Réalise HowItWorks (téléphone collé et 4 étapes au défilement avec useScroll,
parent en overflow: clip), CateringTeaser, Stats, ReserveCta, Faq (accordéon
accessible) et Location (iframe Google Maps en lazy, adresse et horaires
depuis /settings/), puis la page /nous-trouver et /mentions-legales.
```

### Étape 6 — Traiteur

```
Réalise /traiteur selon docs/maquettes/Traiteur.dc.html : héros, 8 types
d'événements, 3 formules (le bouton « Choisir » pré-sélectionne la formule
dans le formulaire), déroulé en 4 étapes.
QuoteForm : React Hook Form + schéma Zod partagé, Server Action createQuote
vers POST /catering/quotes/, champ piège, IP du visiteur transmise en
X-Forwarded-For, écran de confirmation avec le lien WhatsApp renvoyé par l'API.
```

### Étape 7 — Réservation

```
Réalise /reserver selon docs/maquettes/ResaSite.dc.html : ReservationWizard
en 3 étapes (date et couverts, créneau, coordonnées) puis confirmation.
Créneaux lus via une route app/api/availability/route.ts qui relaie GET
/reservations/availability/ sans cache.
Server Action createReservation vers POST /reservations/, mêmes règles que
QuoteForm ; au-delà du nombre maximal de personnes, afficher le lien vers
/traiteur.
```

### Étape 8 — Mise en ligne

```
Ajoute les metadata de chaque page, opengraph-image.tsx, le JSON-LD
Restaurant dans le layout, sitemap.ts et robots.ts.
Crée app/api/revalidate/route.ts (vérifie x-revalidate-secret, appelle
revalidateTag("menu")).
Passe un audit Lighthouse mobile et corrige ce qui est sous 90, puis décris
dans le README les étapes de déploiement Coolify.
```
