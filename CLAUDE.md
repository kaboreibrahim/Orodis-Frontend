# CLAUDE.md — Site vitrine Les Délices d'Orodis

Site vitrine Next.js 15 (App Router, TypeScript strict, Tailwind CSS v4, Motion) d'un restaurant ivoirien. Il lit la carte et les réglages dans l'API Django et lui envoie réservations et devis.

## Règles

1. **Lire `docs/architecture.md` avant chaque étape.** Il fixe l'arborescence, les routes, la charte, les animations et le découpage en 8 étapes. En cas de doute, il fait foi.
2. **S'inspirer de `docs/maquettes/`** pour la mise en page, les textes, les couleurs et les animations (voir `docs/maquettes/LISEZMOI.md`). Ce sont des références, pas du code à copier : les images `/_blob/...` ne s'affichent pas, utiliser `public/` ou les photos de l'API.
3. **Textes en français**, y compris les messages d'erreur, les `aria-label` et les textes alternatifs. Apostrophe typographique `’` dans le JSX.
4. **Composants serveur par défaut.** `"use client"` seulement pour ce qui est interactif ou animé ; la section serveur lit les données et les passe au composant client.
5. **Aucune couleur en dur hors des tokens** de `app/globals.css` (`bg-bordeaux`, `text-texte-doux`, `border-bordure`…). Une couleur de maquette absente des tokens s'ajoute d'abord dans `@theme`, jamais en `#hex` dans un composant.
6. **`prefers-reduced-motion` respecté partout** : avec Motion, `useReducedMotion()` ou `<MotionConfig reducedMotion="user">` ; le contenu doit s'afficher directement, sans animation.

## Conventions

- Polices : `font-display` (Fraunces 600/700, romain et italique) pour les titres, `font-sans` (DM Sans 400/500/700) pour le reste. Le mot fort d'un titre est en italique bordeaux.
- Formes : boutons `rounded-full`, cartes arrondies 22 à 26 px, champs de 48 px, zones cliquables de 44 px minimum.
- Courbe d'animation : `--ease-orodis` / `[0.16, 1, 0.3, 1]`.
- Prix et dates : toujours via `lib/format.ts` (`formatPrice(4500)` → `4 500 F`).
- Accès à l'API : uniquement par `lib/api/` côté serveur ; le navigateur ne parle jamais directement à Django. Formulaires par Server Actions (`app/actions/`).
- Types de l'API : générés dans `lib/api/schema.d.ts` par `npx openapi-typescript $API_URL/api/schema/ -o lib/api/schema.d.ts`, jamais écrits à la main.
- Images : `next/image`, `sizes` renseigné, `priority` seulement pour la photo du héros.
- Logos dans `public/` : `logo-delices-orodis-web.png` (couleur) et `logo-delices-orodis-blanc-web.png` (fonds sombres), 800 × 709 ; les versions sans `-web` sont les originaux en 2508 × 2222.

## Commandes

```bash
npm run dev     # développement, http://localhost:3000
npm run build   # build de production (sortie standalone)
npm run lint
```

Copier `.env.example` en `.env.local` et renseigner `API_URL` avant de lancer.

## Vérifier

- Rendu à 390 px et 1440 px de large.
- `npm run lint` et `npm run build` sans erreur avant de terminer une étape.
