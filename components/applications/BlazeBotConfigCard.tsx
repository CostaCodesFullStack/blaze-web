import Link from "next/link";
import { Power, Settings, Terminal } from "lucide-react";
import type { BlazeBotDashboardConfig } from "@/lib/blaze-bot/dashboard";

type BlazeBotConfigCardProps = {
  config: BlazeBotDashboardConfig | null;
};

export default function BlazeBotConfigCard({
  config,
}: BlazeBotConfigCardProps) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
            <Settings className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Configuração
            </p>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Blaze Bot
            </p>
          </div>
        </div>

        <Link
          href="/applications/blaze-bot/settings"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 text-xs font-semibold text-orange-500 transition-all hover:border-orange-500/40 hover:bg-orange-500/10"
        >
          <Settings className="h-3.5 w-3.5" />
          Ajustar
        </Link>
      </div>

      {config ? (
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                config.enabled
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-zinc-500/10 text-zinc-500"
              }`}
            >
              <Power className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Status
              </dt>

              <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">
                {config.enabled ? "Ativa" : "Desativada"}
              </dd>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-500">
              <Terminal className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Prefixo
              </dt>

              <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900 dark:text-white">
                {config.prefix}
              </dd>
            </div>
          </div>
        </dl>
      ) : (
        <div className="mt-5 rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Não configurado
          </p>

          <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Configure o Blaze Bot para concluir a integração com o servidor.
          </p>
        </div>
      )}
    </section>
  );
}
