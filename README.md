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
docker run -p 3000:3000 -e API_URL=https://api.delicesdorodis.ci/api/v1 orodis-web
```

Le déploiement Coolify sera décrit à l'étape 8.
