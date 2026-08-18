import "server-only";
import { getApplicationById } from "@/lib/db/repositories/applications";
import { getGuildApplicationByUserAndApplication } from "@/lib/db/repositories/guild-applications";
import { getBlazeBotConfig } from "@/lib/db/repositories/blaze-bot-config";
import { getSubscriptionByUserAndApplication } from "@/lib/db/repositories/subscriptions";
import { resolveApplicationAccess } from "@/lib/subscriptions/access";
import type { SubscriptionAccessStatus } from "@/lib/subscriptions/access";
import { checkBlazeBotConnection } from "@/lib/blaze-bot/client";
import {
  BLAZE_BOT_SUPPORTED_OPERATIONS,
  isSupportedBlazeBotOperation,
  type BlazeBotOperationName,
} from "@/lib/blaze-bot/contract";

export type { BlazeBotOperationName } from "@/lib/blaze-bot/contract";

export type BlazeBotOperationsCapabilityState =
  | "backend-unavailable"
  | "app-inactive"
  | "no-access"
  | "no-guild"
  | "not-configured"
  | "disabled"
  | "offline"
  | "ready";

export type BlazeBotOperationsCapability = {
  backendSupported: boolean;
  supportedOperations: readonly BlazeBotOperationName[];
  state: BlazeBotOperationsCapabilityState;
  online: boolean | null;
};

const CAPABILITY_FROM_FACTS: (
  facts: {
    applicationActive: boolean;
    subscriptionStatus: SubscriptionAccessStatus;
    hasGuild: boolean;
    configEnabled: boolean | null;
    botOnline: boolean | null;
  },
  supportedOperations: readonly BlazeBotOperationName[],
) => BlazeBotOperationsCapability = (facts, supportedOperations) => {
  const backendSupported = supportedOperations.length > 0;
  const base = { backendSupported, supportedOperations, online: facts.botOnline };

  if (!facts.applicationActive) {
    return { ...base, state: "app-inactive" };
  }

  if (facts.subscriptionStatus !== "ACTIVE") {
    return { ...base, state: "no-access" };
  }

  if (!facts.hasGuild) {
    return { ...base, state: "no-guild" };
  }

  if (facts.configEnabled === null) {
    return { ...base, state: "not-configured" };
  }

  if (!facts.configEnabled) {
    return { ...base, state: "disabled" };
  }

  if (facts.botOnline !== true) {
    return { ...base, state: "offline" };
  }

  if (!backendSupported) {
    return { ...base, state: "backend-unavailable" };
  }

  return { ...base, state: "ready" };
};

/**
 * Deriva a capacidade de operações a partir de fatos já carregados pela página
 * (sem novas consultas ao banco nem nova verificação do bot).
 */
export function resolveBlazeBotOperationsCapabilityFromFacts(input: {
  applicationActive: boolean;
  subscriptionStatus: SubscriptionAccessStatus;
  hasGuild: boolean;
  configEnabled: boolean | null;
  botOnline: boolean | null;
}): BlazeBotOperationsCapability {
  return CAPABILITY_FROM_FACTS(input, BLAZE_BOT_SUPPORTED_OPERATIONS);
}

/**
 * Resolve a capacidade de operações fazendo a cadeia completa no servidor.
 * Revalida sessão/aplicação/acesso/Guild/configuração/estado do bot.
 */
export async function resolveBlazeBotOperationsCapability(input: {
  userId: string;
  applicationId: string;
}): Promise<BlazeBotOperationsCapability> {
  const application = await getApplicationById(input.applicationId);
  const applicationActive = application?.active ?? false;

  const subscription = await getSubscriptionByUserAndApplication(
    input.userId,
    input.applicationId,
  );

  const accessResult = resolveApplicationAccess(
    { active: applicationActive },
    subscription,
  );

  const guildApplication = await getGuildApplicationByUserAndApplication(
    input.userId,
    input.applicationId,
  );

  const guild = guildApplication?.guild ?? null;

  const config = guild ? await getBlazeBotConfig(guild.id) : null;

  let botOnline: boolean | null = null;

  if (guild && config?.enabled) {
    const bot = await checkBlazeBotConnection();
    botOnline = bot.ok;
  }

  return CAPABILITY_FROM_FACTS(
    {
      applicationActive,
      subscriptionStatus: accessResult.status,
      hasGuild: guild !== null,
      configEnabled: config?.enabled ?? null,
      botOnline,
    },
    BLAZE_BOT_SUPPORTED_OPERATIONS,
  );
}

export type BlazeBotOperationError =
  | "unknown-operation"
  | "app-inactive"
  | "no-access"
  | "no-guild"
  | "not-configured"
  | "disabled"
  | "offline"
  | "backend-unavailable";

export type BlazeBotOperationResult =
  | { ok: true; operation: BlazeBotOperationName }
  | { ok: false; error: BlazeBotOperationError; safeMessage: string };

const OPERATION_ERROR_MESSAGES: Record<BlazeBotOperationError, string> = {
  "unknown-operation": "Operação desconhecida.",
  "app-inactive": "Esta aplicação está indisponível no momento.",
  "no-access": "Sem acesso a esta aplicação.",
  "no-guild": "Nenhum servidor vinculado.",
  "not-configured": "O Blaze Bot não está configurado para este servidor.",
  disabled: "O Blaze Bot está desativado.",
  offline: "O Blaze Bot está offline. Tente novamente mais tarde.",
  "backend-unavailable":
    "Backend operacional do Blaze Bot ainda não conectado.",
};

export function describeBlazeBotOperationError(
  error: BlazeBotOperationError,
): string {
  return OPERATION_ERROR_MESSAGES[error];
}

const CAPABILITY_STATE_ERROR: Record<
  Exclude<BlazeBotOperationsCapabilityState, "ready">,
  BlazeBotOperationError
> = {
  "backend-unavailable": "backend-unavailable",
  "app-inactive": "app-inactive",
  "no-access": "no-access",
  "no-guild": "no-guild",
  "not-configured": "not-configured",
  disabled: "disabled",
  offline: "offline",
};

export const BLAZE_BOT_FORBIDDEN_BODY_FIELDS: readonly string[] = [
  "command",
  "url",
  "endpoint",
  "userId",
  "guildId",
  "applicationId",
  "discordId",
  "token",
  "apiKey",
  "authorization",
];

export type BlazeBotOperationRequest =
  | { ok: true; operation: string }
  | { ok: false; error: "invalid-body"; safeMessage: string };

/**
 * Valida o corpo de uma requisição de operação: aceita somente um objeto com o
 * campo `operation` (string). Qualquer campo proibido (IDs, url, endpoint,
 * command, credenciais) invalida a requisição.
 */
export function parseBlazeBotOperationRequest(body: unknown): BlazeBotOperationRequest {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "invalid-body", safeMessage: "Corpo da requisição inválido." };
  }

  const record = body as Record<string, unknown>;
  const forbidden = BLAZE_BOT_FORBIDDEN_BODY_FIELDS.find(
    (field) => record[field] !== undefined,
  );

  if (forbidden) {
    return {
      ok: false,
      error: "invalid-body",
      safeMessage: "Corpo da requisição inválido.",
    };
  }

  if (typeof record.operation !== "string" || record.operation.trim() === "") {
    return { ok: false, error: "invalid-body", safeMessage: "Operação não informada." };
  }

  return { ok: true, operation: record.operation.trim() };
}

/**
 * Executa uma operação do Blaze Bot, exclusivamente no servidor.
 *
 * - Nunca aceita endpoint, URL, guildId, userId ou credenciais do client;
 * - Valida a allowlist e a cadeia de autorização; só executa com o bot ONLINE;
 * - O backend real ainda não expõe operações, então este caminho retorna
 *   sempre um erro honesto e NUNCA fabrica sucesso.
 */
export async function executeBlazeBotOperation(input: {
  userId: string;
  applicationId: string;
  operation: string;
}): Promise<BlazeBotOperationResult> {
  if (!isSupportedBlazeBotOperation(input.operation)) {
    return {
      ok: false,
      error: "unknown-operation",
      safeMessage: describeBlazeBotOperationError("unknown-operation"),
    };
  }

  const capability = await resolveBlazeBotOperationsCapability({
    userId: input.userId,
    applicationId: input.applicationId,
  });

  if (capability.state !== "ready") {
    const error = CAPABILITY_STATE_ERROR[capability.state];

    return {
      ok: false,
      error,
      safeMessage: describeBlazeBotOperationError(error),
    };
  }

  return {
    ok: false,
    error: "backend-unavailable",
    safeMessage: describeBlazeBotOperationError("backend-unavailable"),
  };
}
