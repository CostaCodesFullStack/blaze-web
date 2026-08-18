import Link from "next/link";
import { ArrowRight, Bot, Server as ServerIcon } from "lucide-react";
import { buildGuildIconUrl } from "@/lib/shared/discord";

type GuildSummary = {
  discordId: string;
  name: string;
  icon: string | null;
};

type ApplicationSummary = {
  slug: string;
  name: string;
};

export default function ApplicationHeader({
  application,
  guild,
}: {
  application: ApplicationSummary;
  guild: GuildSummary | null;
}) {
  const guildIconUrl = guild?.icon
    ? buildGuildIconUrl(guild.discordId, guild.icon)
    : null;

  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
          <Bot className="h-7 w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-2xl">
            {application.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <ServerIcon className="h-4 w-4" />

            {guild ? (
              <span
                className="flex min-w-0 items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300"
                data-testid="connected-guild"
              >
                {guildIconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={guildIconUrl}
                    alt={`Ícone do servidor ${guild.name}`}
                    className="h-5 w-5 shrink-0 rounded-full"
                  />
                ) : null}

                <span className="truncate">{guild.name}</span>
              </span>
            ) : (
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                Nenhum servidor conectado
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Aplicação ativa
          </span>

          <Link
            href={`/subscribe/${application.slug}`}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 text-sm font-semibold text-orange-500 transition-all hover:border-orange-500/40 hover:bg-orange-500/10"
          >
            Gerenciar assinatura
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}