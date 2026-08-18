import "server-only";
import { getBlazeBotConfig } from "@/lib/db/repositories/blaze-bot-config";
import {
  resolveBlazeBotStatus,
  resolveBlazeBotIntegrationState,
  type BlazeBotIntegrationState,
} from "@/lib/blaze-bot/status";
import {
  resolveBlazeBotOperationsCapabilityFromFacts,
  type BlazeBotOperationsCapability,
} from "@/lib/blaze-bot/operations";
import { checkBlazeBotConnection } from "@/lib/blaze-bot/client";
import type { BlazeBotUnavailableReason } from "@/lib/blaze-bot/client";
import type { SubscriptionAccessStatus } from "@/lib/subscriptions/access";

export type BlazeBotDashboardGuild = {
  discordId: string;
  name: string;
  icon: string | null;
};

export type BlazeBotDashboardBotCheck = {
  online: boolean | null;
  reason: BlazeBotUnavailableReason | null;
  elapsedMs: number | null;
  checkedAt: Date | null;
  checkedAtLabel: string | null;
};

export type BlazeBotDashboardConfig = {
  enabled: boolean;
  prefix: string;
};

export type BlazeBotDashboardData = {
  guild: BlazeBotDashboardGuild | null;
  subscriptionStatus: SubscriptionAccessStatus;
  integrationState: BlazeBotIntegrationState;
  config: BlazeBotDashboardConfig | null;
  bot: BlazeBotDashboardBotCheck;
  operations: BlazeBotOperationsCapability;
};

function formatCheckedAt(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Monta todos os dados do dashboard do Blaze Bot em uma única passada:
 *
 * - A Guild é resolvida pela página (cadeia de segurança) e recebida pronta;
 * - Busca a configuração do bot para a Guild (1 consulta);
 * - Executa no máximo uma verificação de saúde do bot;
 * - Não escreve nada no banco; não repete a checagem de assinatura.
 */
export async function getBlazeBotDashboard(input: {
  userId: string;
  applicationId: string;
  applicationActive: boolean;
  subscriptionStatus: SubscriptionAccessStatus;
  guild: {
    id: string;
    discordId: string;
    name: string;
    icon: string | null;
  } | null;
}): Promise<BlazeBotDashboardData> {
  const { applicationActive, subscriptionStatus, guild } = input;

  const config = guild ? await getBlazeBotConfig(guild.id) : null;

  const granted = applicationActive && subscriptionStatus === "ACTIVE";

  const authStatus = resolveBlazeBotStatus({
    applicationActive,
    accessResult: { allowed: granted, status: subscriptionStatus },
    hasGuildApplication: guild !== null,
    configEnabled: config?.enabled ?? null,
  });

  let bot: BlazeBotDashboardBotCheck = {
    online: null,
    reason: null,
    elapsedMs: null,
    checkedAt: null,
    checkedAtLabel: null,
  };

  if (authStatus === "CONNECTED" && config) {
    const checkedAt = new Date();
    const startedAt = performance.now();
    const result = await checkBlazeBotConnection();
    const elapsedMs = Math.max(0, Math.round(performance.now() - startedAt));

    bot = {
      online: result.ok,
      reason: result.ok ? null : result.reason,
      elapsedMs,
      checkedAt,
      checkedAtLabel: formatCheckedAt(checkedAt),
    };
  }

  const integrationState = resolveBlazeBotIntegrationState({
    authStatus,
    applicationActive,
    botOnline: bot.online,
  });

  const operations = resolveBlazeBotOperationsCapabilityFromFacts({
    applicationActive,
    subscriptionStatus,
    hasGuild: guild !== null,
    configEnabled: config?.enabled ?? null,
    botOnline: bot.online,
  });

  return {
    guild: guild
      ? { discordId: guild.discordId, name: guild.name, icon: guild.icon }
      : null,
    subscriptionStatus,
    integrationState,
    config: config ? { enabled: config.enabled, prefix: config.prefix } : null,
    bot,
    operations,
  };
}
