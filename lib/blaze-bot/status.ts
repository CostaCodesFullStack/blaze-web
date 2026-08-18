import { getApplicationById } from "@/lib/db/repositories/applications";
import { getGuildApplicationByUserAndApplication } from "@/lib/db/repositories/guild-applications";
import { getBlazeBotConfig } from "@/lib/db/repositories/blaze-bot-config";
import { getSubscriptionByUserAndApplication } from "@/lib/db/repositories/subscriptions";
import { resolveApplicationAccess } from "@/lib/subscriptions/access";
import type { ApplicationAccessResult } from "@/lib/subscriptions/access";

export type BlazeBotConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "NOT_CONFIGURED"
  | "INACTIVE";

export type BlazeBotIntegrationState =
  | "AUTHORIZED"
  | "ONLINE"
  | "OFFLINE"
  | "NOT_CONFIGURED"
  | "NO_ACCESS"
  | "UNAVAILABLE"
  | "DISABLED";

export type BlazeBotGuildSummary = {
  discordId: string;
  name: string;
  icon: string | null;
};

export type BlazeBotGlobalStatus = {
  status: BlazeBotConnectionStatus;
  connected: boolean;
  applicationActive: boolean;
  accessGranted: boolean;
  subscriptionStatus: ApplicationAccessResult["status"];
  hasGuildApplication: boolean;
  guild: BlazeBotGuildSummary | null;
  hasConfig: boolean;
  configEnabled: boolean | null;
  configPrefix: string | null;
};

export function resolveBlazeBotStatus(input: {
  applicationActive: boolean;
  accessResult: ApplicationAccessResult;
  hasGuildApplication: boolean;
  configEnabled: boolean | null;
}): BlazeBotConnectionStatus {
  const granted = input.accessResult.allowed && input.accessResult.status === "ACTIVE";

  if (!input.applicationActive) {
    return "INACTIVE";
  }

  if (!granted || !input.hasGuildApplication) {
    return "DISCONNECTED";
  }

  if (input.configEnabled === null) {
    return "NOT_CONFIGURED";
  }

  if (!input.configEnabled) {
    return "INACTIVE";
  }

  return "CONNECTED";
}

/**
 * Combina o status de autorização/configuração com a conectividade real do bot.
 *
 * ONLINE só significa que o backend do bot respondeu à verificação de saúde.
 * "Servidor autorizado" (AUTHORIZED) indica que a Guild está vinculada, mas o
 * bot ainda não foi consultado (ou a consulta não alterou o estado de exibição).
 */
export function resolveBlazeBotIntegrationState(input: {
  authStatus: BlazeBotConnectionStatus;
  applicationActive: boolean;
  botOnline: boolean | null;
}): BlazeBotIntegrationState {
  const { authStatus, applicationActive, botOnline } = input;

  if (authStatus === "INACTIVE") {
    return applicationActive ? "DISABLED" : "UNAVAILABLE";
  }

  if (authStatus === "DISCONNECTED") {
    return "NO_ACCESS";
  }

  if (authStatus === "NOT_CONFIGURED") {
    return "NOT_CONFIGURED";
  }

  if (botOnline === true) {
    return "ONLINE";
  }

  if (botOnline === false) {
    return "OFFLINE";
  }

  return "AUTHORIZED";
}

export async function getBlazeBotStatus(
  userId: string,
  applicationId: string,
): Promise<BlazeBotGlobalStatus> {
  const application = await getApplicationById(applicationId);

  const applicationActive = application?.active ?? false;

  const subscription = await getSubscriptionByUserAndApplication(
    userId,
    applicationId,
  );

  const accessResult = resolveApplicationAccess(
    { active: applicationActive },
    subscription,
  );

  const guildApplication = await getGuildApplicationByUserAndApplication(
    userId,
    applicationId,
  );

  const guild = guildApplication?.guild
    ? {
        discordId: guildApplication.guild.discordId,
        name: guildApplication.guild.name,
        icon: guildApplication.guild.icon,
      }
    : null;

  const config = guildApplication?.guild
    ? await getBlazeBotConfig(guildApplication.guild.id)
    : null;

  const status = resolveBlazeBotStatus({
    applicationActive,
    accessResult,
    hasGuildApplication: guild !== null,
    configEnabled: config?.enabled ?? null,
  });

  return {
    status,
    connected: status === "CONNECTED",
    applicationActive,
    accessGranted: accessResult.allowed && accessResult.status === "ACTIVE",
    subscriptionStatus: accessResult.status,
    hasGuildApplication: guild !== null,
    guild,
    hasConfig: config !== null,
    configEnabled: config?.enabled ?? null,
    configPrefix: config?.prefix ?? null,
  };
}