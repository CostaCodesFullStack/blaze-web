import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ApplicationHeader from "@/components/applications/ApplicationHeader";
import ApplicationSidebar from "@/components/applications/ApplicationSidebar";
import BlazeBotSettings from "@/components/applications/BlazeBotSettings";
import BlazeBotStatusCard from "@/components/applications/BlazeBotStatusCard";
import {
  BlazeBotAccessCard,
  BlazeBotMissingUserCard,
} from "@/components/applications/BlazeBotAccessCards";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { getGuildApplicationByUserAndApplication } from "@/lib/db/repositories/guild-applications";
import { upsertBlazeBotConfig } from "@/lib/db/repositories/blaze-bot-config";
import {
  requireApplicationAccess,
  type ApplicationAccessCheck,
} from "@/lib/subscriptions/require-access";
import { buildGuildIconUrl } from "@/lib/shared/discord";
import {
  getBlazeBotStatus,
  resolveBlazeBotIntegrationState,
  type BlazeBotGlobalStatus,
  type BlazeBotIntegrationState,
} from "@/lib/blaze-bot/status";
import { checkBlazeBotConnection } from "@/lib/blaze-bot/client";
import type { SubscriptionAccessStatus } from "@/lib/subscriptions/access";

const APPLICATION_SLUG = "blaze-bot";

const FALLBACK_STATUS_RESULT: Omit<BlazeBotGlobalStatus, "guild"> & {
  guild: BlazeBotGlobalStatus["guild"];
} = {
  status: "DISCONNECTED" as const,
  connected: false,
  applicationActive: false,
  accessGranted: false,
  subscriptionStatus: "NONE" as SubscriptionAccessStatus,
  hasGuildApplication: false,
  guild: null,
  hasConfig: false,
  configEnabled: null,
  configPrefix: null,
};

export default async function BlazeBotSettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect(
      `/auth/login?redirect=${encodeURIComponent(`/applications/${APPLICATION_SLUG}/settings`)}`,
    );
  }

  const application = await getApplicationBySlug(APPLICATION_SLUG);

  if (!application) {
    notFound();
  }

  const user = await getUserByDiscordId(session.id);

  let check: ApplicationAccessCheck = {
    granted: false,
    result: { allowed: false, status: "NONE" },
  };

  if (user) {
    try {
      check = await requireApplicationAccess(user.id, application.id);
    } catch (error) {
      console.error("BlazeBot settings: failed to check application access:", error);
    }
  }

  const denied = !user || !check.granted;

  let guild: {
    id: string;
    discordId: string;
    name: string;
    icon: string | null;
  } | null = null;

  let config: { enabled: boolean; prefix: string };

  let integrationStatus: BlazeBotGlobalStatus = FALLBACK_STATUS_RESULT;

  if (!denied && user) {
    const guildApplication = await getGuildApplicationByUserAndApplication(
      user.id,
      application.id,
    );

    guild = guildApplication?.guild ?? null;

    if (!guild) {
      config = { enabled: true, prefix: "!" };
    } else {
      const resolved = await upsertBlazeBotConfig(guild.id, {});
      config = { enabled: resolved.enabled, prefix: resolved.prefix };

      try {
        integrationStatus = await getBlazeBotStatus(user.id, application.id);
      } catch (error) {
        console.error(
          "BlazeBot settings: failed to resolve integration status:",
          error,
        );
      }
    }
  } else {
    config = { enabled: true, prefix: "!" };
  }

  let botOnline: boolean | null = null;

  if (integrationStatus.status === "CONNECTED") {
    try {
      const bot = await checkBlazeBotConnection();
      botOnline = bot.ok;
    } catch (error) {
      console.error("BlazeBot settings: failed to probe the bot:", error);
      botOnline = false;
    }
  }

  const integrationState: BlazeBotIntegrationState =
    resolveBlazeBotIntegrationState({
      authStatus: integrationStatus.status,
      applicationActive: integrationStatus.applicationActive,
      botOnline,
    });

  const guildIconUrl = guild?.icon
    ? buildGuildIconUrl(guild.discordId, guild.icon)
    : null;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl justify-center px-6 py-12 lg:px-8">
        <div className="w-full">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o painel
          </Link>

          {denied ? (
            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-md">
                {user ? (
                  <BlazeBotAccessCard
                    application={application}
                    status={check.result.status}
                  />
                ) : (
                  <BlazeBotMissingUserCard application={application} />
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-6 lg:flex-row">
              <aside className="shrink-0 lg:w-60">
                <ApplicationSidebar active={`/applications/blaze-bot/settings`} />
              </aside>

              <div className="min-w-0 flex-1">
                <ApplicationHeader application={application} guild={guild} />

                <div className="mt-6">
                  <BlazeBotStatusCard
                    integrationState={integrationState}
                    guildName={integrationStatus.guild?.name ?? null}
                    guildIconUrl={guildIconUrl}
                    configEnabled={integrationStatus.configEnabled}
                    subscriptionStatus={integrationStatus.subscriptionStatus}
                  />
                </div>

                <div className="mt-6">
                  <BlazeBotSettings
                    applicationName={application.name}
                    enabled={config.enabled}
                    prefix={config.prefix}
                    guild={guild}
                    guildIconUrl={guildIconUrl}
                    hasGuild={guild !== null}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}