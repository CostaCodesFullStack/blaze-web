import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Check,
  Clock,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { getGuildApplicationByUserAndApplication } from "@/lib/db/repositories/guild-applications";
import { buildGuildIconUrl } from "@/lib/shared/discord";

type SubscribeSuccessPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export default async function SubscribeSuccessPage({
  params,
  searchParams,
}: SubscribeSuccessPageProps) {
  const { slug } = await params;
  const { session_id: sessionId } = await searchParams;

  if (!SLUG_PATTERN.test(slug)) {
    notFound();
  }

  const session = await getSession();

  if (!session) {
    redirect(
      `/auth/login?redirect=${encodeURIComponent(`/subscribe/${slug}/success`)}`,
    );
  }

  const application = await getApplicationBySlug(slug);

  if (!application) {
    notFound();
  }

  if (!application.active) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Header />

        <div className="mx-auto flex w-full max-w-7xl justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                  <Bot className="h-7 w-7" />
                </div>
              </div>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Aplicação indisponível
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Esta aplicação está indisponível no momento. Tente novamente
                mais tarde.
              </p>

              <Link
                href="/dashboard"
                className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-400 hover:shadow-orange-500/20"
              >
                Voltar para o Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  const user = await getUserByDiscordId(session.id);
  const guildApplication = user
    ? await getGuildApplicationByUserAndApplication(user.id, application.id)
    : null;

  const guild = guildApplication?.guild ?? null;

  if (!guild) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Header />

        <div className="mx-auto flex w-full max-w-7xl justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                  <ShieldAlert className="h-7 w-7" />
                </div>
              </div>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Não foi possível confirmar o servidor.
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                A aplicação {application.name} ainda não foi vinculada a um
                servidor na sua conta. Volte e autorize o Blaze Bot no Discord.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={`/subscribe/${application.slug}`}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-400 hover:shadow-orange-500/20"
                >
                  Autorizar aplicação
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/dashboard"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-500/20 bg-zinc-500/5 px-5 text-sm font-semibold text-zinc-600 transition-all hover:border-zinc-500/40 hover:bg-zinc-500/10 dark:text-zinc-300"
                >
                  Voltar para o Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  const guildIconUrl = guild.icon ? buildGuildIconUrl(guild.discordId, guild.icon) : null;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* Confirmation card */}
          <div className="rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
            {/* Success */}
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Check className="h-7 w-7" />
              </div>
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Servidor conectado
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Seu servidor foi conectado com sucesso ao Blaze Bot.
            </p>

            {/* Guild */}
            <div className="mt-6 flex items-center gap-4 rounded-xl border border-black/5 bg-black/[0.02] p-4 text-left dark:border-white/5 dark:bg-white/[0.02]">
              {guildIconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={guildIconUrl}
                  alt={guild.name}
                  className="h-11 w-11 shrink-0 rounded-full"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate font-semibold text-zinc-950 dark:text-white">
                  {guild.name}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Discord
                </p>
              </div>
            </div>

            {/* Checks */}
            <div className="mt-3 space-y-2 text-left">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-2.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Bot autorizado
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-2.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Servidor vinculado
                </span>
              </div>
            </div>
          </div>

          {/* Application */}
          <div className="mt-4 flex items-center gap-4 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20">
            {application.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={application.icon}
                alt={application.name}
                className="h-12 w-12 shrink-0 rounded-xl"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Bot className="h-6 w-6" />
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-950 dark:text-white">
                {application.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
                {application.description}
              </p>
            </div>
          </div>

          {/* Next step */}
          <div className="mt-4 rounded-2xl border border-orange-500/15 bg-orange-500/5 p-5 text-center dark:border-orange-500/20">
            <p className="text-sm leading-6 text-orange-600 dark:text-orange-400">
              Agora você pode continuar para configurar sua assinatura.
            </p>
          </div>

          {/* Payment pending */}
          {sessionId && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 dark:border-amber-500/25">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Pagamento em processamento
                </p>
                <p className="mt-1 text-sm leading-5 text-amber-600/90 dark:text-amber-400/90">
                  Estamos aguardando a confirmação do pagamento. Em breve sua
                  aplicação estará pronta.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href={`/subscribe/${application.slug}/checkout`}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-400 hover:shadow-orange-500/20"
            >
              Continuar para assinatura
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-500/20 bg-zinc-500/5 px-5 text-sm font-semibold text-zinc-600 transition-all hover:border-zinc-500/40 hover:bg-zinc-500/10 dark:text-zinc-300"
            >
              Voltar ao Dashboard
            </Link>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-500 dark:text-zinc-400">
            <TriangleAlert className="h-3.5 w-3.5" />
            Conectar o servidor ainda não ativa a assinatura.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}