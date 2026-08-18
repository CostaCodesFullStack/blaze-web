/**
 * Contrato do backend operacional do Blaze Bot.
 *
 * Módulo de declaração (sem lógica): fonte única para o endpoint de saúde real
 * e o registro de operações. Nada aqui é executado; operações só são
 * habilitadas quando o backend real fornecer um contrato explícito.
 */

/** Único endpoint real documentado pelo backend até o momento (ETAPA 14I). */
export const BLAZE_BOT_HEALTH_PATH = "/healthz";

export const BLAZE_BOT_HEALTH_CONTRACT = {
  method: "GET",
  path: BLAZE_BOT_HEALTH_PATH,
  successCodes: [200],
  response: { status: "online" },
} as const;

/**
 * Nomes candidatos de operação. NENHUMA é suportada hoje: o backend real não
 * expõe contrato de operações, portanto o registro abaixo é mantido vazio.
 */
export type BlazeBotOperationName = "restart" | "reload";

export type BlazeBotOperationDefinition = {
  id: BlazeBotOperationName;
  method: "POST";
  path: string;
  request: { operation: BlazeBotOperationName };
  response: { ok: true; operation: BlazeBotOperationName } | { ok: false; error: string };
  successCodes: readonly number[];
  timeoutMs: number;
};

/**
 * Registro de contratos de operação fornecidos pelo backend real.
 *
 * Para habilitar uma operação, adicione a definição AQUI com o contrato real
 * documentado pelo backend (id, método, endpoint interno, request/response,
 * códigos HTTP e timeout). Enquanto a lista estiver vazia, toda operação é
 * rejeitada — nunca inventamos operações nem endpoints.
 */
export const BLAZE_BOT_OPERATION_CONTRACTS: readonly BlazeBotOperationDefinition[] = [];

export const BLAZE_BOT_SUPPORTED_OPERATIONS: readonly BlazeBotOperationName[] =
  BLAZE_BOT_OPERATION_CONTRACTS.map((contract) => contract.id);

export function isSupportedBlazeBotOperation(
  value: unknown,
): value is BlazeBotOperationName {
  return (
    typeof value === "string" &&
    (BLAZE_BOT_SUPPORTED_OPERATIONS as readonly string[]).includes(value)
  );
}
