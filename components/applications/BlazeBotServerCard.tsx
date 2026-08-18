import Link from "next/link";
import { Server as ServerIcon } from "lucide-react";

type BlazeBotServerCardProps = {
  guild: { discordId: string; name: string; icon: string | null } | null;
  guildIconUrl: string | null;
  applicationSlug: string;
};

export default function BlazeBotServerCard({
  guild,
  guildIconUrl,
  applicationSlug,
}: BlazeBotServerCardProps) {
  return (
    <section className="flex items-center gap-4 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20">
      {guild ? (
        <>
          {guildIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={guildIconUrl}
              alt={`Ícone do servidor ${guild.name}`}
              className="h-12 w-12 shrink-0 rounded-full"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <ServerIcon className="h-6 w-6" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Servidor conectado
            </p>

            <p className="mt-0.5 truncate font-semibold text-zinc-950 dark:text-white">
              {guild.name}
            </p>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Discord
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-500/10 text-zinc-500">
            <ServerIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Nenhum servidor
            </p>

            <Link
              href={`/api/subscribe/discord?application=${encodeURIComponent(applicationSlug)}`}
              className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 transition-colors hover:text-orange-400"
            >
              Conectar servidor
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
