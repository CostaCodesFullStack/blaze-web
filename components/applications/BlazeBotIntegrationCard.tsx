import {
  Activity,
  Bot,
  Clock,
  Server as ServerIcon,
  ShieldCheck,
  Timer,
} from "lucide-react";
import type { BlazeBotIntegrationState } from "@/lib/blaze-bot/status";
import type { BlazeBotUnavailableReason } from "@/lib/blaze-bot/client";
import type { SubscriptionAccessStatus } from "@/lib/subscriptions/access";
import type { BlazeBotDashboardBotCheck } from "@/lib/blaze-bot/dashboard";

const INTEGRATION_META: Record<
  BlazeBotIntegrationState,
  { label: string; title: string; hint: string; dotClass: string; pillClass: string }
> = {
  ONLINE: {
    label: "Bot online",
    title: "Bot online",
    hint: "O backend do Blaze Bot respondeu à comunicação do painel. A Guild está autorizada e a configuração está ativa.",
    dotClass: "bg-emerald-500",
    pillClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  OFFLINE: {
    label: "Bot offline",
    title: "Bot offline",
    hint: "A Guild está autorizada e configurada, mas o backend do Blaze Bot não respondeu. Tente novamente mais tarde.",
    dotClass: "bg-red-500",
    pillClass:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  },
  AUTHORIZED: {
    label: "Servidor autorizado",
    title: "Servidor autorizado",
    hint: "A Guild está vinculada ao usuário e à aplicação. A conectividade com o bot ainda não foi confirmada.",
    dotClass: "bg-orange-500",
    pillClass:
      "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  NOT_CONFIGURED: {
    label: "Não configurado",
    title: "Integração não configurada",
    hint: "Configure o Blaze Bot para concluir a integração com o servidor.",
    dotClass: "bg-amber-500",
    pillClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  NO_ACCESS: {
    label: "Sem acesso",
    title: "Aplicação sem acesso",
    hint: "Ative a assinatura ou vincule um servidor para acessar a integração.",
    dotClass: "bg-red-500",
    pillClass:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  },
  UNAVAILABLE: {
    label: "Indisponível",
    title: "Aplicação indisponível",
    hint: "Esta aplicação está indisponível no momento.",
    dotClass: "bg-zinc-400",
    pillClass:
      "border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  },
  DISABLED: {
    label: "Desativado",
    title: "Integração desativada",
    hint: "Habilite o bot nas configurações para ativar a integração.",
    dotClass: "bg-zinc-400",
    pillClass:
      "border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  },
};

const SUBSCRIPTION_LABELS: Record<SubscriptionAccessStatus, string> = {
  ACTIVE: "Ativa",
  EXPIRED: "Expirada",
  CANCELED: "Cancelada",
  INACTIVE: "Indisponível",
  NONE: "Não assinada",
};

const REASON_LABELS: Record<BlazeBotUnavailableReason, string> = {
  "not-configured": "Backend não configurado",
  timeout: "Tempo de resposta esgotado",
  unavailable: "Backend indisponível",
  "invalid-response": "Resposta inválida",
};

type BlazeBotIntegrationCardProps = {
  integrationState: BlazeBotIntegrationState;
  guildName: string | null;
  subscriptionStatus: SubscriptionAccessStatus;
  bot: BlazeBotDashboardBotCheck;
};

export default function BlazeBotIntegrationCard({
  integrationState,
  guildName,
  subscriptionStatus,
  bot,
}: BlazeBotIntegrationCardProps) {
  const meta = INTEGRATION_META[integrationState];
  const lastCheckLabel = bot.checkedAtLabel ?? "Ainda não verificada";
  const responseTimeLabel =
    bot.elapsedMs !== null ? `${bot.elapsedMs} ms` : "—";
  const offlineReasonLabel =
    bot.online === false && bot.reason ? REASON_LABELS[bot.reason] : null;

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
          <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dotClass}`} />
          {meta.label}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {meta.title}
        </p>

        <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {meta.hint}
        </p>

        {offlineReasonLabel ? (
          <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Motivo: {offlineReasonLabel}
          </p>
        ) : null}
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-500">
            <ServerIcon className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Servidor autorizado
            </dt>

            <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {guildName ?? "Nenhum servidor conectado"}
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
              {SUBSCRIPTION_LABELS[subscriptionStatus]}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Clock className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Última verificação
            </dt>

            <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {lastCheckLabel}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <Timer className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Tempo de resposta
            </dt>

            <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {responseTimeLabel}
            </dd>
          </div>
        </div>
      </dl>

      <p className="mt-5 flex items-start gap-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        O status &quot;online&quot; indica que o backend do Blaze Bot respondeu
        à comunicação do painel. O Gateway de comandos do Discord ainda não foi
        implementado, então o bot ainda não fica online no Discord.
      </p>
    </section>
  );
}
