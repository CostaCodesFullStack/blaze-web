import Link from "next/link";
import {
  ArrowRight,
  Bot,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import type { SubscriptionAccessStatus } from "@/lib/subscriptions/access";

const ACTION_BASE_CLASS =
  "flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold";
const ACTION_PRIMARY_CLASS =
  "bg-orange-500 text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-400 hover:shadow-orange-500/20";
const ACTION_SECONDARY_CLASS =
  "border border-orange-500/20 bg-orange-500/5 text-orange-500 transition-all hover:border-orange-500/40 hover:bg-orange-500/10";
const ACTION_DISABLED_CLASS =
  "cursor-not-allowed border border-zinc-500/20 bg-zinc-500/5 text-zinc-500 dark:text-zinc-400";

type DeniedState = {
  icon: "bot" | "alert";
  title: string;
  message: string;
  cta: React.ReactNode;
};

function buildDeniedState(
  application: { slug: string; active: boolean },
  status: SubscriptionAccessStatus,
): DeniedState {
  if (!application.active) {
    return {
      icon: "alert",
      title: "Aplicação indisponível",
      message:
        "Esta aplicação está indisponível no momento. Tente novamente mais tarde.",
      cta: (
        <button
          type="button"
          disabled
          className={`${ACTION_BASE_CLASS} ${ACTION_DISABLED_CLASS}`}
        >
          Indisponível
        </button>
      ),
    };
  }

  switch (status) {
    case "NONE":
      return {
        icon: "bot",
        title: "Você ainda não possui esta aplicação",
        message:
          "Assine o Blaze Bot pelo Discord para liberar o acesso à aplicação e comece a gerenciar sua comunidade.",
        cta: (
          <Link
            href={`/subscribe/${application.slug}`}
            className={`${ACTION_BASE_CLASS} ${ACTION_PRIMARY_CLASS}`}
          >
            Assinar aplicação no Discord
            <ArrowRight className="h-4 w-4" />
          </Link>
        ),
      };
    case "EXPIRED":
      return {
        icon: "alert",
        title: "Assinatura expirada",
        message:
          "Sua assinatura do Blaze Bot expirou. Renove para continuar usando a aplicação.",
        cta: (
          <Link
            href={`/subscribe/${application.slug}`}
            className={`${ACTION_BASE_CLASS} ${ACTION_SECONDARY_CLASS}`}
          >
            Renovar assinatura
            <RefreshCw className="h-4 w-4" />
          </Link>
        ),
      };
    case "CANCELED":
      return {
        icon: "alert",
        title: "Assinatura cancelada",
        message:
          "Sua assinatura do Blaze Bot foi cancelada. Reative para voltar a usar a aplicação.",
        cta: (
          <Link
            href={`/subscribe/${application.slug}`}
            className={`${ACTION_BASE_CLASS} ${ACTION_SECONDARY_CLASS}`}
          >
            Reativar assinatura
            <RefreshCw className="h-4 w-4" />
          </Link>
        ),
      };
    case "INACTIVE":
    default:
      return {
        icon: "alert",
        title: "Assinatura indisponível",
        message:
          "Sua assinatura do Blaze Bot está indisponível no momento. Tente novamente mais tarde.",
        cta: (
          <button
            type="button"
            disabled
            className={`${ACTION_BASE_CLASS} ${ACTION_DISABLED_CLASS}`}
          >
            Indisponível
          </button>
        ),
      };
  }
}

export function BlazeBotAccessCard({
  application,
  status,
}: {
  application: {
    slug: string;
    name: string;
    description: string;
    active: boolean;
  };
  status: SubscriptionAccessStatus;
}) {
  const state = buildDeniedState(application, status);

  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
      <div className="flex justify-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            state.icon === "alert"
              ? "bg-red-500/10 text-red-500"
              : "bg-orange-500/10 text-orange-500"
          }`}
        >
          {state.icon === "alert" ? (
            <ShieldAlert className="h-7 w-7" />
          ) : (
            <Bot className="h-7 w-7" />
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {application.name}
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {application.description}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-black/5 bg-black/[0.02] p-4 text-center dark:border-white/5 dark:bg-white/[0.02]">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {state.title}
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {state.message}
        </p>
      </div>

      <div className="mt-6">{state.cta}</div>
    </div>
  );
}

export function BlazeBotMissingUserCard({
  application,
}: {
  application: { name: string; description: string };
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <ShieldAlert className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          {application.name}
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {application.description}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-black/5 bg-black/[0.02] p-4 text-center dark:border-white/5 dark:bg-white/[0.02]">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Conta não encontrada
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Não foi possível identificar sua conta. Faça login novamente para
          continuar.
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard"
          className={`${ACTION_BASE_CLASS} ${ACTION_SECONDARY_CLASS}`}
        >
          Voltar para o painel
        </Link>
      </div>
    </div>
  );
}