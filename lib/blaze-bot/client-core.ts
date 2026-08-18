import { BLAZE_BOT_HEALTH_PATH } from "@/lib/blaze-bot/contract";

const CONNECTION_TIMEOUT_MS = 3000;

export type BlazeBotUnavailableReason =
  | "not-configured"
  | "timeout"
  | "unavailable"
  | "invalid-response";

export type BlazeBotConnectionCheck =
  | { ok: true; status: "online" }
  | { ok: false; status: "offline"; reason: BlazeBotUnavailableReason };

function getBaseUrl(): string {
  return (process.env.BLAZE_BOT_API_URL ?? "").trim();
}

function getApiKey(): string | undefined {
  const key = process.env.BLAZE_BOT_API_KEY;

  if (key && key.trim() !== "") {
    return key;
  }

  return undefined;
}

function buildHealthUrl(): string | null {
  const base = getBaseUrl();

  if (!base) {
    return null;
  }

  return `${base.replace(/\/+$/, "")}${BLAZE_BOT_HEALTH_PATH}`;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

/**
 * Consulta o backend do Blaze Bot (health check) de forma server-side.
 *
 * - Nunca aceita URL/endpoint/credenciais vindos do client;
 * - Usa apenas BLAZE_BOT_API_URL / BLAZE_BOT_API_KEY (variáveis de ambiente);
 * - Não retorna nem loga a API key;
 * - Possui timeout e diferencia: não configurado, timeout, indisponível e
 *   resposta inválida.
 *
 * Este módulo não marca `server-only` por conta própria: ele é exposto apenas
 * através de `lib/blaze-bot/client.ts`, que adiciona o guard de servidor. Isso
 * mantém o núcleo testável sem expor o entry público a Client Components.
 */
export async function checkBlazeBotConnection(
  timeoutMs: number = CONNECTION_TIMEOUT_MS,
): Promise<BlazeBotConnectionCheck> {
  const healthUrl = buildHealthUrl();

  if (!healthUrl) {
    return { ok: false, status: "offline", reason: "not-configured" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const apiKey = getApiKey();

    const response = await fetch(healthUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        status: "offline",
        reason: response.status >= 500 ? "unavailable" : "invalid-response",
      };
    }

    const payload: unknown = await response.json().catch(() => null);

    if (
      typeof payload !== "object" ||
      payload === null ||
      (payload as { status?: unknown }).status !== "online"
    ) {
      return { ok: false, status: "offline", reason: "invalid-response" };
    }

    return { ok: true, status: "online" };
  } catch (error) {
    if (isAbortError(error)) {
      return { ok: false, status: "offline", reason: "timeout" };
    }

    return { ok: false, status: "offline", reason: "unavailable" };
  } finally {
    clearTimeout(timeoutId);
  }
}