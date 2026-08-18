import { BookOpen, Play } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/layout/Footer";
import ApplicationCard from "@/components/dashboard/ApplicationCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  resolveApplicationAccess,
  type ApplicationAccessResult,
} from "@/lib/subscriptions/access";
import { getSession } from "@/lib/auth/session";
import { getApplications } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { getGuildApplicationsByUser } from "@/lib/db/repositories/guild-applications";
import { getUserSubscriptions } from "@/lib/db/repositories/subscriptions";
import type {
  Application,
  Subscription,
} from "@/generated/prisma/client";

const APPLICATION_PAGES = new Set(["blaze-bot"]);

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login?redirect=/dashboard");
  }

  let applications: Application[] = [];

  try {
    applications = await getApplications();
  } catch (error) {
    console.error("Failed to load applications:", error);
  }

  const subscriptionByApplication = new Map<string, Subscription>();
  const connectedGuildByApplication = new Map<string, string>();

  try {
    const user = await getUserByDiscordId(session.id);

    if (!user) {
      console.error(
        "Dashboard: user not found in the database for discordId:",
        session.id,
      );
    } else {
      const subscriptions = await getUserSubscriptions(user.id);

      for (const subscription of subscriptions) {
        subscriptionByApplication.set(
          subscription.applicationId,
          subscription,
        );
      }

      const guildApplications = await getGuildApplicationsByUser(user.id);

      for (const guildApplication of guildApplications) {
        if (
          !connectedGuildByApplication.has(guildApplication.applicationId)
        ) {
          connectedGuildByApplication.set(
            guildApplication.applicationId,
            guildApplication.guild.name,
          );
        }
      }
    }
  } catch (error) {
    console.error("Failed to load subscriptions:", error);
  }

  const now = new Date();
  const accessByApplication = new Map<string, ApplicationAccessResult>();

  for (const application of applications) {
    const subscription = subscriptionByApplication.get(application.id) ?? null;
    accessByApplication.set(
      application.id,
      resolveApplicationAccess(application, subscription, now),
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <DashboardHeader
        userId={session.id}
        username={session.username}
        avatar={session.avatar}
      />

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Welcome */}
        <section>
          <p className="text-sm font-medium text-orange-500">
            Painel do cliente
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            Olá, {session.global_name ?? session.username}.
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Gerencie suas aplicações, assinaturas e recursos da Blaze em um só
            lugar.
          </p>
        </section>

        {/* Applications */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
                Suas aplicações
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Aplicações disponíveis para sua conta.
              </p>
            </div>
          </div>

          {applications.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  access={
                    accessByApplication.get(application.id) ?? {
                      allowed: false,
                      status: "NONE" as const,
                    }
                  }
                  href={
                    APPLICATION_PAGES.has(application.slug)
                      ? `/applications/${application.slug}`
                      : undefined
                  }
                  connectedGuildName={connectedGuildByApplication.get(
                    application.id,
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Nenhuma aplicação disponível no momento.
              </p>
            </div>
          )}
        </section>

        {/* Quick links */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">
            Saiba mais
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Aprenda mais sobre nossas aplicações antes de utilizá-las.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Link
              href="/docs"
              className="group flex min-h-36 items-center gap-5 rounded-2xl border border-black/10 bg-white p-6 transition-all hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <BookOpen className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-semibold text-zinc-950 dark:text-white">
                  Documentação
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Aprenda como configurar e utilizar nossas aplicações.
                </p>

                <span className="mt-3 inline-block text-sm font-medium text-orange-500">
                  Acessar documentação →
                </span>
              </div>
            </Link>

            <Link
              href="/presentation"
              className="group flex min-h-36 items-center gap-5 rounded-2xl border border-black/10 bg-white p-6 transition-all hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Play className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-semibold text-zinc-950 dark:text-white">
                  Apresentação
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Veja demonstrações e descubra como nossas aplicações
                  funcionam.
                </p>

                <span className="mt-3 inline-block text-sm font-medium text-orange-500">
                  Ver apresentação →
                </span>
              </div>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
