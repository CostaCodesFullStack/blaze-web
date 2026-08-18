import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ApplicationHeader from "@/components/applications/ApplicationHeader";
import BlazeBotDashboard from "@/components/applications/BlazeBotDashboard";
import ApplicationSidebar from "@/components/applications/ApplicationSidebar";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { getGuildApplicationByUserAndApplication } from "@/lib/db/repositories/guild-applications";
import {
  requireApplicationAccess,
  type ApplicationAccessCheck,
} from "@/lib/subscriptions/require-access";
import type { SubscriptionAccessStatus } from "@/lib/subscriptions/access";
import { buildGuildIconUrl } from "@/lib/shared/discord";
import {
  getBlazeBotDashboard,
  type BlazeBotDashboardData,
} from "@/lib/blaze-bot/dashboard";

const APPLICATION_SLUG = "blaze-bot";

const ACTION_BASE_CLASS =
  "flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold";
const ACTION_PRIMARY_CLASS =
  "bg-orange-500 text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-400 hover:shadow-orange-500/20";
const ACTION_SECONDARY_CLASS =
  "border border-orange-500/20 bg-orange-500/5 text-orange-500 transition-all hover:border-orange-500/40 hover:bg-orange-500/10";
const ACTION_DISABLED_CLASS =
  "cursor-not-allowed border border-zinc-500/20 bg-zinc-500/5 text-zinc-500 dark:text-zinc-400";

type DeniedState = {
  icon: "bot" | "alert";
  title: string;
  message: string;
  cta: React.ReactNode;
};

function buildDeniedState(
  application: { slug: string; active: boolean },
  status: SubscriptionAccessStatus,
): DeniedState {
  if (!application.active) {
    return {
      icon: "alert",
      title: "Aplicação indisponível",
      message:
        "Esta aplicação está indisponível no momento. Tente novamente mais tarde.",
      cta: (
        <button
          type="button"
          disabled
          className={`${ACTION_BASE_CLASS} ${ACTION_DISABLED_CLASS}`}
        >
          Indisponível
        </button>
      ),
    };
  }

  switch (status) {
    case "NONE":
      return {
        icon: "bot",
        title: "Você ainda não possui esta aplicação",
        message:
          "Assine o Blaze Bot pelo Discord para liberar o acesso à aplicação e comece a gerenciar sua comunidade.",
        cta: (
          <Link
            href={`/subscribe/${application.slug}`}
            className={`${ACTION_BASE_CLASS} ${ACTION_PRIMARY_CLASS}`}
          >
            Assinar aplicação no Discord
            <ArrowRight className="h-4 w-4" />
          </Link>
        ),
      };
    case "EXPIRED":
      return {
        icon: "alert",
        title: "Assinatura expirada",
        message:
          "Sua assinatura do Blaze Bot expirou. Renove para continuar usando a aplicação.",
        cta: (
          <Link
            href={`/subscribe/${application.slug}`}
            className={`${ACTION_BASE_CLASS} ${ACTION_SECONDARY_CLASS}`}
          >
            Renovar assinatura
            <RefreshCw className="h-4 w-4" />
          </Link>
        ),
      };
    case "CANCELED":
      return {
        icon: "alert",
        title: "Assinatura cancelada",
        message:
          "Sua assinatura do Blaze Bot foi cancelada. Reative para voltar a usar a aplicação.",
        cta: (
          <Link
            href={`/subscribe/${application.slug}`}
            className={`${ACTION_BASE_CLASS} ${ACTION_SECONDARY_CLASS}`}
          >
            Reativar assinatura
            <RefreshCw className="h-4 w-4" />
          </Link>
        ),
      };
    case "INACTIVE":
    default:
      return {
        icon: "alert",
        title: "Assinatura indisponível",
        message:
          "Sua assinatura do Blaze Bot está indisponível no momento. Tente novamente mais tarde.",
        cta: (
          <button
            type="button"
            disabled
            className={`${ACTION_BASE_CLASS} ${ACTION_DISABLED_CLASS}`}
          >
            Indisponível
          </button>
        ),
      };
  }
}

type DeniedCardProps = {
  application: {
    slug: string;
    name: string;
    description: string;
    active: boolean;
  };
  status: SubscriptionAccessStatus;
};

function DeniedCard({ application, status }: DeniedCardProps) {
  const state = buildDeniedState(application, status);

  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
      <div className="flex justify-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            state.icon === "alert"
              ? "bg-red-500/10 text-red-500"
              : "bg-orange-500/10 text-orange-500"
          }`}
        >
          {state.icon === "alert" ? (
            <ShieldAlert className="h-7 w-7" />
          ) : (
            <Bot className="h-7 w-7" />
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {application.name}
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {application.description}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-black/5 bg-black/[0.02] p-4 text-center dark:border-white/5 dark:bg-white/[0.02]">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {state.title}
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {state.message}
        </p>
      </div>

      <div className="mt-6">{state.cta}</div>
    </div>
  );
}

type MissingUserCardProps = {
  application: { name: string; description: string };
};

function MissingUserCard({ application }: MissingUserCardProps) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <ShieldAlert className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {application.name}
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {application.description}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-black/5 bg-black/[0.02] p-4 text-center dark:border-white/5 dark:bg-white/[0.02]">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Conta não encontrada
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Não foi possível identificar sua conta. Faça login novamente para
          continuar.
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard"
          className={`${ACTION_BASE_CLASS} ${ACTION_SECONDARY_CLASS}`}
        >
          Voltar para o painel
        </Link>
      </div>
    </div>
  );
}

export default async function BlazeBotApplicationPage() {
  const session = await getSession();

  if (!session) {
    redirect(
      `/auth/login?redirect=${encodeURIComponent(`/applications/${APPLICATION_SLUG}`)}`,
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
      console.error("BlazeBot: failed to check application access:", error);
    }
  }

  const denied = !user || !check.granted;

  let guild: {
    id: string;
    discordId: string;
    name: string;
    icon: string | null;
  } | null = null;

  let dashboard: BlazeBotDashboardData | null = null;

  if (!denied && user) {
    const guildApplication = await getGuildApplicationByUserAndApplication(
      user.id,
      application.id,
    );

    const guildRecord = guildApplication?.guild ?? null;

    guild = guildRecord
      ? {
          id: guildRecord.id,
          discordId: guildRecord.discordId,
          name: guildRecord.name,
          icon: guildRecord.icon,
        }
      : null;

    try {
      dashboard = await getBlazeBotDashboard({
        userId: user.id,
        applicationId: application.id,
        applicationActive: application.active,
        subscriptionStatus: check.result.status,
        guild,
      });
    } catch (error) {
      console.error(
        "BlazeBot: failed to assemble dashboard:",
        error,
      );
    }
  }

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
                  <DeniedCard
                    application={application}
                    status={check.result.status}
                  />
                ) : (
                  <MissingUserCard application={application} />
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-6 lg:flex-row">
              <aside className="shrink-0 lg:w-60">
                <ApplicationSidebar />
              </aside>

              <div className="min-w-0 flex-1">
                <ApplicationHeader application={application} guild={guild} />

                <div className="mt-6">
                  {dashboard ? (
                    <BlazeBotDashboard
                      application={{ slug: application.slug }}
                      guildIconUrl={guildIconUrl}
                      data={dashboard}
                    />
                  ) : (
                    <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-8">
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                        Indisponível no momento
                      </p>

                      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        Não foi possível carregar os dados do dashboard. Tente
                        novamente mais tarde.
                      </p>
                    </div>
                  )}
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