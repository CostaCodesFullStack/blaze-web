import {
  BarChart3,
  Bot,
  Command,
  Gauge,
  MessagesSquare,
  Sparkles,
  Timer,
  Users,
  Wrench,
} from "lucide-react";
import type { BlazeBotDashboardData } from "@/lib/blaze-bot/dashboard";
import BlazeBotIntegrationCard from "@/components/applications/BlazeBotIntegrationCard";
import BlazeBotServerCard from "@/components/applications/BlazeBotServerCard";
import BlazeBotConfigCard from "@/components/applications/BlazeBotConfigCard";
import BlazeBotOperationsCard from "@/components/applications/BlazeBotOperationsCard";

const UPCOMING_METRICS: Array<{
  label: string;
  icon: typeof Users;
}> = [
  { label: "Jogadores online", icon: Users },
  { label: "Desempenho (TPS / RAM / CPU)", icon: Gauge },
  { label: "Tempo de atividade (uptime)", icon: Timer },
  { label: "Comandos executados", icon: Command },
  { label: "Mensagens processadas", icon: MessagesSquare },
  { label: "Estatísticas de uso", icon: BarChart3 },
];

type BlazeBotDashboardProps = {
  application: { slug: string };
  guildIconUrl: string | null;
  data: BlazeBotDashboardData;
};

export default function BlazeBotDashboard({
  application,
  guildIconUrl,
  data,
}: BlazeBotDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-8">
        <p className="text-sm font-medium text-orange-500">Blaze Bot</p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Dashboard do Blaze Bot.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Acompanhe o status da integração, a conectividade do bot e a
          configuração atual do servidor.
        </p>
      </section>

      {/* Integration */}
      <BlazeBotIntegrationCard
        integrationState={data.integrationState}
        guildName={data.guild?.name ?? null}
        subscriptionStatus={data.subscriptionStatus}
        bot={data.bot}
      />

      {/* Server + config */}
      <div className="grid gap-4 md:grid-cols-2">
        <BlazeBotServerCard
          guild={data.guild}
          guildIconUrl={guildIconUrl}
          applicationSlug={application.slug}
        />

        <BlazeBotConfigCard config={data.config} />
      </div>

      {/* Operations */}
      <BlazeBotOperationsCard capability={data.operations} />

      {/* Upcoming / unavailable data */}
      <section className="rounded-3xl border border-dashed border-zinc-500/25 bg-transparent p-6 dark:border-white/15 sm:p-8">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Informações futuras
          </h3>
        </div>

        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Métricas e recursos dependem do backend real do Blaze Bot e serão
          liberados nas próximas atualizações.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UPCOMING_METRICS.map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.label}
                className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    {metric.label}
                  </p>

                  <p className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <Sparkles className="h-3 w-3" />
                    Disponível em breve
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="flex items-start gap-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Apenas dados reais disponíveis são exibidos neste painel. Nenhuma métrica
        é simulada enquanto o backend do Blaze Bot não for integrado.
      </p>
    </div>
  );
}
