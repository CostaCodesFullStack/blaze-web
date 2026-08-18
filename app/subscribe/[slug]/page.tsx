import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Bot } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { type SubscriptionStatus } from "@/components/dashboard/ApplicationCard";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { getSubscriptionByUserAndApplication } from "@/lib/db/repositories/subscriptions";

type SubscribePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

const SLUG_PATTERN = /^[a-z0-9-]+$/;

const errorMessages: Record<string, string> = {
  denied: "Autorização negada no Discord.",
  invalid_callback: "Credenciais inválidas. Tente novamente.",
  expired: "A solicitação expirou. Tente novamente.",
  no_guild:
    "Nenhum servidor foi selecionado. Escolha um servidor ao autorizar.",
  token_exchange_failed:
    "Falha ao confirmar a autorização com o Discord. Tente novamente.",
};

const discordButtonClass =
  "group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-5 text-sm font-semibold text-white shadow-lg shadow-[#5865F2]/20 transition-all hover:bg-[#4752C4] hover:shadow-[#5865F2]/30";

export default async function SubscribePage({
  params,
  searchParams,
}: SubscribePageProps) {
  const { slug } = await params;
  const { error } = await searchParams;

  if (!SLUG_PATTERN.test(slug)) {
    notFound();
  }

  const session = await getSession();

  if (!session) {
    redirect(
      `/auth/login?redirect=${encodeURIComponent(`/subscribe/${slug}`)}`,
    );
  }

  const application = await getApplicationBySlug(slug);

  if (!application) {
    notFound();
  }

  let subscriptionStatus: SubscriptionStatus = "NONE";

  try {
    const user = await getUserByDiscordId(session.id);

    if (!user) {
      console.error(
        "Subscribe: user not found in the database for discordId:",
        session.id,
      );
    } else {
      const subscription = await getSubscriptionByUserAndApplication(
        user.id,
        application.id,
      );

      if (subscription) {
        if (
          subscription.status === "ACTIVE" &&
          subscription.expiresAt &&
          subscription.expiresAt.getTime() <= new Date().getTime()
        ) {
          subscriptionStatus = "EXPIRED";
        } else {
          subscriptionStatus = subscription.status;
        }
      }
    }
  } catch (error) {
    console.error("Subscribe: failed to load subscription:", error);
  }

  const unavailable = !application.active;
  const discordCtaHref = `/api/subscribe/discord?application=${encodeURIComponent(slug)}`;

  let statusLabel: string;
  let cta: React.ReactNode;

  if (unavailable) {
    statusLabel = "Esta aplicação está indisponível no momento.";
    cta = (
      <button
        type="button"
        disabled
        className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-zinc-500/20 bg-zinc-500/5 px-5 text-sm font-semibold text-zinc-500 dark:text-zinc-400"
      >
        Indisponível
      </button>
    );
  } else {
    switch (subscriptionStatus) {
      case "ACTIVE":
        statusLabel = "Você já possui esta aplicação ativa.";
        cta = (
          <Link
            href="#"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-400 hover:shadow-orange-500/20"
          >
            Acessar aplicação
          </Link>
        );
        break;
      case "EXPIRED":
        statusLabel = "Esta assinatura expirou.";
        cta = (
          <Link
            href={`/subscribe/${application.slug}/checkout`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 px-5 text-sm font-semibold text-orange-500 transition-all hover:border-orange-500/40 hover:bg-orange-500/10"
          >
            Renovar assinatura
          </Link>
        );
        break;
      case "CANCELED":
        statusLabel = "Esta assinatura foi cancelada.";
        cta = (
          <Link
            href={`/subscribe/${application.slug}/checkout`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 px-5 text-sm font-semibold text-orange-500 transition-all hover:border-orange-500/40 hover:bg-orange-500/10"
          >
            Reativar assinatura
          </Link>
        );
        break;
      case "INACTIVE":
        statusLabel = "Esta assinatura está inativa.";
        cta = (
          <button
            type="button"
            disabled
            className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-zinc-500/20 bg-zinc-500/5 px-5 text-sm font-semibold text-zinc-500 dark:text-zinc-400"
          >
            Indisponível
          </button>
        );
        break;
      case "NONE":
      default:
        statusLabel = "Você ainda não possui esta aplicação.";
        cta = (
          <a
            href={discordCtaHref}
            className={discordButtonClass}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M19.54 5.02A16.84 16.84 0 0 0 15.5 3.76l-.5 1.02a15.6 15.6 0 0 0-6 0l-.5-1.02a16.84 16.84 0 0 0-4.04 1.26C1.9 8.85 1.2 12.6 1.55 16.3a16.93 16.93 0 0 0 5.18 2.63l1.27-1.67c-.7-.26-1.38-.58-2.03-.95l.5-.38c3.91 1.83 8.17 1.83 12.03 0l.5.38c-.65.37-1.33.69-2.03.95l1.27 1.67a16.93 16.93 0 0 0 5.18-2.63c.4-4.29-.68-8-3.91-11.28ZM8.73 14.87c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4c1.2 0 2.17 1.08 2.15 2.4 0 1.32-.95 2.4-2.15 2.4Zm6.54 0c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4c1.2 0 2.17 1.08 2.15 2.4 0 1.32-.95 2.4-2.15 2.4Z" />
            </svg>
            Continuar com Discord
          </a>
        );
        break;
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* Back */}
          <Link
            href="/dashboard"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o painel
          </Link>

          {/* Error */}
          {error && errorMessages[error] && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
              <p className="text-sm text-red-500 dark:text-red-400">
                {errorMessages[error]}
              </p>
            </div>
          )}

          {/* Card */}
          <div className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                <Bot className="h-7 w-7" />
              </div>
            </div>

            {/* Application info */}
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {application.name}
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {application.description}
              </p>
            </div>

            {/* Status */}
            <div className="mt-6 rounded-xl border border-black/5 bg-black/[0.02] p-4 text-center dark:border-white/5 dark:bg-white/[0.02]">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                {statusLabel}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-6">{cta}</div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}