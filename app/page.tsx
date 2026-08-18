import Link from "next/link";
import { ArrowRight, BookOpen, Play } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--background)]">
      <Header />

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-240px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[-150px] h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      {/* Hero */}
      <section className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-sm text-zinc-600 backdrop-blur dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
              Aplicações para comunidades
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl dark:text-white">
              Suas comunidades.
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                Mais inteligentes.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl dark:text-zinc-400">
              Aplicações profissionais para automatizar, organizar e
              potencializar sua comunidade.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-400 hover:shadow-orange-500/30 sm:w-auto"
              >
                Entrar com Discord
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#applications"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-black/[0.03] px-6 text-sm font-semibold text-zinc-900 transition-all hover:bg-black/[0.06] sm:w-auto dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
              >
                Conhecer aplicações
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Applications */}
      <section
        id="applications"
        className="border-t border-black/10 dark:border-white/10"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
              Nossa plataforma
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
              Tudo que sua comunidade precisa.
            </h2>

            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Explore nossas aplicações e encontre as ferramentas certas para
              sua comunidade.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {/* Application Card */}
            <div className="group rounded-2xl border border-black/10 bg-black/[0.02] p-7 transition-all hover:border-orange-500/30 hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <BookOpen className="h-5 w-5" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-zinc-950 dark:text-white">
                Aplicações profissionais
              </h3>

              <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
                Ferramentas desenvolvidas para facilitar a gestão e operação da
                sua comunidade.
              </p>

              <Link
                href="/presentation"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-500 transition-colors hover:text-orange-400"
              >
                Conhecer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Presentation Card */}
            <div className="group rounded-2xl border border-black/10 bg-black/[0.02] p-7 transition-all hover:border-orange-500/30 hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Play className="h-5 w-5" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-zinc-950 dark:text-white">
                Veja antes de adquirir
              </h3>

              <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
                Conheça nossas aplicações, veja demonstrações e descubra como
                elas funcionam na prática.
              </p>

              <Link
                href="/presentation"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-500 transition-colors hover:text-orange-400"
              >
                Ver apresentação
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
