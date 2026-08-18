import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Server as ServerIcon,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlanSelector from "@/components/subscribe/PlanSelector";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { getGuildApplicationByUserAndApplication } from "@/lib/db/repositories/guild-applications";
import { buildGuildIconUrl } from "@/lib/shared/discord";
import { getSubscriptionPlans } from "@/lib/subscribe/plans";

type CheckoutPageProps = {
  params: Promise<{ slug: string }>;
};

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;

  if (!SLUG_PATTERN.test(slug)) {
    notFound();
  }

  const session = await getSession();

  if (!session) {
    redirect(
      `/auth/login?redirect=${encodeURIComponent(`/subscribe/${slug}/checkout`)}`,
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
            <Link
              href={`/subscribe/${application.slug}`}
              className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>

            <div className="rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-500/10 text-zinc-500">
                  <ServerIcon className="h-7 w-7" />
                </div>
              </div>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Conecte seu servidor primeiro
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Para assinar a aplicação {application.name}, é necessário
                autorizar o Blaze Bot em um servidor do Discord.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={`/api/subscribe/discord?application=${encodeURIComponent(application.slug)}`}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-400 hover:shadow-orange-500/20"
                >
                  Conectar servidor
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

  const guildIconUrl = guild.icon
    ? buildGuildIconUrl(guild.discordId, guild.icon)
    : null;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-4xl">
          <Link
            href={`/subscribe/${application.slug}/success`}
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a confirmação
          </Link>

          {/* Heading */}
          <div className="text-center">
            <p className="text-sm font-medium text-orange-500">Assinatura</p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Assine sua aplicação
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
              Escolha o plano ideal para manter sua aplicação ativa.
            </p>
          </div>

          {/* Application */}
          <div className="mt-8 flex items-center gap-4 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20">
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

          {/* Connected server */}
          <div className="mt-4 flex items-center gap-4 rounded-3xl border border-emerald-500/15 bg-emerald-500/5 p-6 backdrop-blur-xl dark:border-emerald-500/20">
            {guildIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={guildIconUrl}
                alt={guild.name}
                className="h-12 w-12 shrink-0 rounded-full"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <ServerIcon className="h-6 w-6" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Servidor conectado
              </p>
              <p className="truncate font-semibold text-zinc-950 dark:text-white">
                {guild.name}
              </p>
            </div>

            <span className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 sm:inline-flex dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Pronto para assinatura
            </span>
          </div>

          {/* Plans */}
          <PlanSelector slug={slug} plans={getSubscriptionPlans()} />
        </div>
      </div>

      <Footer />
    </main>
  );
}