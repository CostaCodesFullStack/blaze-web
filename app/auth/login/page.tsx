import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const redirectTo =
    params.redirect && params.redirect.startsWith("/")
      ? params.redirect
      : "/dashboard";

  const discordAuthUrl = `/api/auth/discord?redirect=${encodeURIComponent(
    redirectTo,
  )}`;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-6 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[550px] w-[750px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[130px]" />

        <div className="absolute bottom-[-250px] right-[-150px] h-[450px] w-[450px] rounded-full bg-orange-500/5 blur-[110px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Back */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a página inicial
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-lg font-black text-white shadow-lg shadow-orange-500/20">
              B
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Entre na Blaze
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Acesse suas aplicações e gerencie tudo através do seu Discord.
            </p>
          </div>

          {/* Discord */}
          <div className="mt-8">
            <a
              href={discordAuthUrl}
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-5 text-sm font-semibold text-white shadow-lg shadow-[#5865F2]/20 transition-all hover:bg-[#4752C4] hover:shadow-[#5865F2]/30"
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
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Security */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />

            <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              O acesso é realizado através do Discord. Nós não temos acesso à
              sua senha e você poderá revogar a autorização a qualquer momento.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Ao continuar, você concorda com os termos e políticas da Blaze.
        </p>
      </div>
    </main>
  );
}
