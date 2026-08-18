"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="relative z-50 w-full border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5"
          aria-label="Blaze - Página inicial"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-black text-white shadow-lg shadow-orange-500/20">
            B
          </span>

          <span className="text-xl font-bold tracking-tight text-white">
            Blaze
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navegação principal"
        >
          <Link
            href="/#applications"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Aplicações
          </Link>

          <Link
            href="/docs"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Documentação
          </Link>

          <Link
            href="/presentation"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Apresentação
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            Entrar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors hover:bg-white/[0.06] md:hidden"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-white/10 bg-[#09090b] md:hidden">
          <nav
            className="mx-auto flex max-w-7xl flex-col px-6 py-5"
            aria-label="Navegação mobile"
          >
            <Link
              href="/#applications"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              Aplicações
            </Link>

            <Link
              href="/docs"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              Documentação
            </Link>

            <Link
              href="/presentation"
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              Apresentação
            </Link>

            <div className="my-3 h-px bg-white/10" />

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-zinc-300">Aparência</span>

              <ThemeToggle />
            </div>

            <Link
              href="/login"
              onClick={closeMenu}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Entrar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
