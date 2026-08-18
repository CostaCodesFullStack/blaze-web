import { Bot, Power, Server as ServerIcon, ShieldCheck } from "lucide-react";
import type { SubscriptionAccessStatus } from "@/lib/subscriptions/access";
import type {
  BlazeBotConnectionStatus,
  BlazeBotIntegrationState,
} from "@/lib/blaze-bot/status";

const SUBSCRIPTION_LABELS: Record<SubscriptionAccessStatus, string> = {
  ACTIVE: "Ativa",
  EXPIRED: "Expirada",
  CANCELED: "Cancelada",
  INACTIVE: "Indisponível",
  NONE: "Não assinada",
};

export const BLAZE_BOT_STATUS_LABELS: Record<BlazeBotConnectionStatus, string> = {
  CONNECTED: "Conectado",
  DISCONNECTED: "Desconectado",
  NOT_CONFIGURED: "Não configurado",
  INACTIVE: "Inativo",
};

export const BLAZE_BOT_STATUS_DOT_CLASSES: Record<
  BlazeBotConnectionStatus,
  string
> = {
  CONNECTED: "bg-emerald-500",
  DISCONNECTED: "bg-red-500",
  NOT_CONFIGURED: "bg-amber-500",
  INACTIVE: "bg-zinc-400",
};

export const BLAZE_BOT_STATUS_PILL_CLASSES: Record<
  BlazeBotConnectionStatus,
  string
> = {
  CONNECTED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  DISCONNECTED: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  NOT_CONFIGURED:
    "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  INACTIVE:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
};

const INTEGRATION_STATE_META: Record<
  BlazeBotIntegrationState,
  { label: string; dotClass: string; pillClass: string }
> = {
  ONLINE: {
    label: "Bot online",
    dotClass: "bg-emerald-500",
    pillClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  OFFLINE: {
    label: "Bot offline",
    dotClass: "bg-red-500",
    pillClass:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  },
  AUTHORIZED: {
    label: "Servidor autorizado",
    dotClass: "bg-orange-500",
    pillClass:
      "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  NOT_CONFIGURED: {
    label: "Não configurado",
    dotClass: "bg-amber-500",
    pillClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  NO_ACCESS: {
    label: "Sem acesso",
    dotClass: "bg-red-500",
    pillClass:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  },
  UNAVAILABLE: {
    label: "Indisponível",
    dotClass: "bg-zinc-400",
    pillClass:
      "border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  },
  DISABLED: {
    label: "Desativado",
    dotClass: "bg-zinc-400",
    pillClass:
      "border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  },
};

type BlazeBotIntegrationFacts = {
  status: BlazeBotConnectionStatus;
  applicationActive: boolean;
  accessGranted: boolean;
  hasGuildApplication: boolean;
};

export function describeIntegrationTitle(props: BlazeBotIntegrationFacts): string {
  if (props.status === "CONNECTED") {
    return "Servidor autorizado";
  }

  if (props.status === "NOT_CONFIGURED") {
    return "Configuração necessária";
  }

  if (props.status === "DISCONNECTED") {
    if (!props.accessGranted) {
      return "Assinatura necessária";
    }

    if (!props.hasGuildApplication) {
      return "Servidor pendente";
    }

    return "Servidor autorizado";
  }

  if (!props.applicationActive) {
    return "Aplicação indisponível";
  }

  return "Integração desativada";
}

export function describeIntegrationHint(props: BlazeBotIntegrationFacts): string {
  switch (props.status) {
    case "CONNECTED":
      return "O servidor está autorizado e a configuração do bot está ativa.";
    case "NOT_CONFIGURED":
      return "Configure o Blaze Bot para concluir a integração com o servidor.";
    case "DISCONNECTED":
      if (!props.accessGranted) {
        return "Ative uma assinatura para autorizar a integração do servidor.";
      }

      if (!props.hasGuildApplication) {
        return "Conecte um servidor do Discord para ativar a integração.";
      }

      return "A autorização ou a assinatura ativa é necessária.";
    case "INACTIVE":
      if (!props.applicationActive) {
        return "Esta aplicação está indisponível no momento.";
      }

      return "Habilite o bot nas configurações para ativar a integração.";
  }
}

const STATE_TITLES: Record<BlazeBotIntegrationState, string> = {
  ONLINE: "Bot online",
  OFFLINE: "Bot offline",
  AUTHORIZED: "Servidor autorizado",
  NOT_CONFIGURED: "Integração não configurada",
  NO_ACCESS: "Aplicação sem acesso",
  UNAVAILABLE: "Aplicação indisponível",
  DISABLED: "Integração desativada",
};

const STATE_HINTS: Record<BlazeBotIntegrationState, string> = {
  ONLINE:
    "O backend do Blaze Bot respondeu à comunicação do painel. A Guild está autorizada e a configuração está ativa.",
  OFFLINE:
    "A Guild está autorizada e configurada, mas o backend do Blaze Bot não respondeu. Tente novamente mais tarde.",
  AUTHORIZED:
    "A Guild está vinculada ao usuário e à aplicação. A conectividade com o bot ainda não foi confirmada.",
  NOT_CONFIGURED:
    "Configure o Blaze Bot para concluir a integração com o servidor.",
  NO_ACCESS:
    "Ative a assinatura ou vincule um servidor para acessar a integração.",
  UNAVAILABLE: "Esta aplicação está indisponível no momento.",
  DISABLED: "Habilite o bot nas configurações para ativar a integração.",
};

type BlazeBotStatusCardProps = {
  integrationState: BlazeBotIntegrationState;
  guildName: string | null;
  guildIconUrl: string | null;
  configEnabled: boolean | null;
  subscriptionStatus: SubscriptionAccessStatus;
};

export default function BlazeBotStatusCard(props: BlazeBotStatusCardProps) {
  const meta = INTEGRATION_STATE_META[props.integrationState];
  const hasConfig = props.configEnabled !== null;
  const configLabel = hasConfig
    ? props.configEnabled
      ? "Ativada"
      : "Desativada"
    : "—";

  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
            <Bot className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Status da integração
            </p>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Blaze Bot
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${meta.pillClass}`}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${meta.dotClass}`}
          />
          {meta.label}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {STATE_TITLES[props.integrationState]}
        </p>

        <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {STATE_HINTS[props.integrationState]}
        </p>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-500">
            <ServerIcon className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Servidor conectado
            </dt>

            <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {props.guildName ?? "Nenhum servidor conectado"}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Assinatura
            </dt>

            <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {SUBSCRIPTION_LABELS[props.subscriptionStatus]}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Power className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Configuração
            </dt>

            <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {configLabel}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            {props.guildIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.guildIconUrl}
                alt="Ícone do servidor"
                className="h-4 w-4 rounded-full"
              />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Estado da integração
            </dt>

            <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {meta.label}
            </dd>
          </div>
        </div>
      </dl>

      <p className="mt-5 flex items-start gap-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        O status &quot;online&quot; indica que o backend do Blaze Bot respondeu
        à comunicação do painel. O Gateway de comandos do Discord ainda não foi
        implementado, então o bot ainda não fica online no Discord.
      </p>
    </section>
  );
}