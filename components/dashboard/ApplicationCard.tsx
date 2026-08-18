import Link from "next/link";
import { ArrowRight, Bot, ExternalLink, RefreshCw } from "lucide-react";
import type { Application } from "@/generated/prisma/client";
import type { ApplicationAccessResult } from "@/lib/subscriptions/access";

export type SubscriptionStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "EXPIRED"
  | "CANCELED"
  | "NONE";

type ApplicationCardProps = {
  application: Application;
  access: ApplicationAccessResult;
  href?: string;
  connectedGuildName?: string | null;
};

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; dotClass: string; pillClass: string }
> = {
  ACTIVE: {
    label: "Ativa",
    dotClass: "bg-emerald-500",
    pillClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  },
  INACTIVE: {
    label: "Inativa",
    dotClass: "bg-zinc-400",
    pillClass:
      "border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  },
  EXPIRED: {
    label: "Expirada",
    dotClass: "bg-red-500",
    pillClass: "border-red-500/20 bg-red-500/10 text-red-500",
  },
  CANCELED: {
    label: "Cancelada",
    dotClass: "bg-zinc-400",
    pillClass:
      "border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  },
  NONE: {
    label: "Não assinada",
    dotClass: "bg-zinc-400",
    pillClass:
      "border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  },
};

export default function ApplicationCard({
  application,
  access,
  href = "#",
  connectedGuildName = null,
}: ApplicationCardProps) {
  const status = !application.active
    ? {
        label: "Indisponível",
        dotClass: "bg-zinc-400",
        pillClass:
          "border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-400",
      }
    : STATUS_CONFIG[access.status];

  const action = (() => {
    if (!application.active) {
      return (
        <button
          type="button"
          disabled
          className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-zinc-500/20 bg-zinc-500/5 px-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400"
        >
          Indisponível
        </button>
      );
    }

    if (access.status === "ACTIVE" && access.allowed) {
      return (
        <Link
          href={href}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-400 hover:shadow-orange-500/20"
        >
          Acessar aplicação
          <ExternalLink className="h-4 w-4" />
        </Link>
      );
    }

    if (access.status === "EXPIRED" || access.status === "CANCELED") {
      return (
        <Link
          href={`/subscribe/${application.slug}`}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 text-sm font-semibold text-orange-500 transition-all hover:border-orange-500/40 hover:bg-orange-500/10"
        >
          Renovar aplicação
          <RefreshCw className="h-4 w-4" />
        </Link>
      );
    }

    if (access.status === "NONE") {
      return (
        <Link
          href={`/subscribe/${application.slug}`}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 text-sm font-semibold text-orange-500 transition-all hover:border-orange-500/40 hover:bg-orange-500/10"
        >
          Assinar aplicação no Discord
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      );
    }

    return (
      <button
        type="button"
        disabled
        className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-zinc-500/20 bg-zinc-500/5 px-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400"
      >
        Indisponível
      </button>
    );
  })();

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
      {/* Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        {/* Icon + Status */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
            <Bot className="h-6 w-6" />
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${status.pillClass}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`}
            />
            {status.label}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-zinc-950 dark:text-white">
            {application.name}
          </h3>

          <p className="mt-2 min-h-14 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {application.description}
          </p>
        </div>

        {/* Connected guild */}
        {connectedGuildName && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3.5 py-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {connectedGuildName}
            </span>
            <span className="ml-auto shrink-0 text-xs text-emerald-600/80 dark:text-emerald-400/80">
              Servidor autorizado
            </span>
          </div>
        )}

        {/* Action */}
        <div className="mt-6">{action}</div>
      </div>
    </article>
  );
}
