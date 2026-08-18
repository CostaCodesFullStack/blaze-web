import { Bot, ShieldAlert, Wrench, Zap } from "lucide-react";
import type { BlazeBotOperationsCapability } from "@/lib/blaze-bot/operations";

const STATE_HINTS: Record<
  BlazeBotOperationsCapability["state"],
  string | null
> = {
  ready: "As operações disponíveis estão prontas para uso.",
  "backend-unavailable":
    "O backend operacional do Blaze Bot ainda não está conectado.",
  "app-inactive": "Esta aplicação está indisponível no momento.",
  "no-access": "Ative a assinatura para acessar operações.",
  "no-guild": "Vincule um servidor do Discord para acessar operações.",
  "not-configured": "Configure o Blaze Bot para habilitar operações.",
  disabled: "Habilite o Blaze Bot nas configurações para habilitar operações.",
  offline: "O bot está offline; nenhuma operação pode ser executada.",
};

type BlazeBotOperationsCardProps = {
  capability: BlazeBotOperationsCapability;
};

export default function BlazeBotOperationsCard({
  capability,
}: BlazeBotOperationsCardProps) {
  const unavailable = capability.supportedOperations.length === 0;
  const hint = STATE_HINTS[capability.state];

  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
          <Wrench className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            Operações
          </p>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Blaze Bot
          </p>
        </div>
      </div>

      {unavailable ? (
        <div className="mt-5 rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-zinc-500" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Operações indisponíveis
            </p>
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Esta função será habilitada quando o backend operacional do Blaze
            Bot estiver conectado.
          </p>

          <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            Backend operacional do Blaze Bot ainda não conectado.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {capability.supportedOperations.map((operation) => (
            <div
              key={operation}
              className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Zap className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  {operation}
                </p>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Disponível
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {hint ? (
        <p className="mt-5 flex items-start gap-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {hint}
        </p>
      ) : null}
    </section>
  );
}
