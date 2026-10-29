# Les Délices d'Orodis — site vitrine

Site Next.js 15 du restaurant Les Délices d'Orodis : carte, réservation de table et devis traiteur, alimentés par l'API Django.

- Architecture : [docs/architecture.md](docs/architecture.md)
- Maquettes validées : [docs/maquettes/](docs/maquettes/)
- Règles pour Claude Code : [CLAUDE.md](CLAUDE.md)

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner API_URL
npm run dev
```

## Docker

```bash
docker build --build-arg API_URL=https://api.delicesdorodis.ci/api/v1 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://delicesdorodis.ci -t orodis-web .
docker run -p 3000:3000 -e API_URL=https://api.delicesdorodis.ci/api/v1 \
  -e REVALIDATE_SECRET=… -e FRONTEND_API_KEY=… orodis-web
```

## Mise en ligne (Coolify)

1. Application « orodis-web » depuis ce dépôt, build par le `Dockerfile`, port 3000, domaine principal + `www` redirigé.
2. Variables de build : `API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_GOOGLE_MAPS_EMBED` (les pages statiques lisent l'API au build).
3. Variables d'exécution, secrètes : `API_URL`, `REVALIDATE_SECRET`, `FRONTEND_API_KEY`.
4. Côté Django, mêmes valeurs : `REVALIDATE_SECRET`, `FRONTEND_API_KEY`, et `FRONTEND_REVALIDATE_URL=https://<site>/api/revalidate`.

Vérifier la revalidation après déploiement :

```bash
curl -X POST https://<site>/api/revalidate -H "x-revalidate-secret: …" \
  -H "Content-Type: application/json" -d '{"tags": ["menu", "settings", "catering"]}'
# → {"revalidated":["menu","settings","catering"]}
```
