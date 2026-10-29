// Accès à l'API Django, côté serveur uniquement : API_URL n'est jamais envoyée au navigateur.
import "server-only";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: unknown = null,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
  }
}

type ApiOptions = RequestInit & {
  /** Durée de cache en secondes ; 10 minutes par défaut. */
  revalidate?: number | false;
  /** Tags vidés par revalidateTag() ; « menu » par défaut (route /api/revalidate). */
  tags?: string[];
};

/** Appelle l'API : api<Type>("/settings/"). Lève ApiError si l'API ne répond pas ou renvoie une erreur. */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { revalidate = 600, tags = ["menu"], headers, ...init } = options;
  const baseUrl = process.env.API_URL;
  if (!baseUrl) throw new Error("API_URL manquante : renseignez-la dans .env.local ou dans Coolify.");

  const url = `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...headers },
      ...(init.cache === "no-store" ? {} : { next: { revalidate, tags } }),
    });
  } catch (cause) {
    throw new ApiError(`L'API ne répond pas (${url}).`, 0, null, { cause });
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(`L'API a répondu ${response.status} pour ${path}.`, response.status, data);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
