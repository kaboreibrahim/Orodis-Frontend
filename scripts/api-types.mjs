// Génère lib/api/schema.d.ts depuis le Swagger du backend : npm run api:types
// Le schéma est servi à la racine de l'API (/api/schema/), pas sous /api/v1.
import { writeFileSync } from "node:fs";
import nextEnv from "@next/env";
import openapiTS, { astToString } from "openapi-typescript";

nextEnv.loadEnvConfig(process.cwd());

const apiUrl = process.env.API_URL;
if (!apiUrl) {
  console.error("API_URL manquante : renseignez-la dans .env.local.");
  process.exit(1);
}

const schemaUrl = new URL("/api/schema/", apiUrl);
const ast = await openapiTS(schemaUrl);
writeFileSync("lib/api/schema.d.ts", astToString(ast));
console.log(`Types générés depuis ${schemaUrl.href}`);
