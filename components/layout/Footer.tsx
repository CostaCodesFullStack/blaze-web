import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white dark:border-white/10 dark:bg-[#09090b]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 sm:text-sm">
              © 2026 BlazeSystem. Todos os direitos reservados.
            </span>
          </div>

          <nav
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm"
            aria-label="Navegação do rodapé"
          >
            <Link
              href="/docs"
              className="text-zinc-500 transition-colors hover:text-orange-500"
            >
              Documentação
            </Link>

            <Link
              href="/presentation"
              className="text-zinc-500 transition-colors hover:text-orange-500"
            >
              Apresentação
            </Link>

            <Link
              href="/#applications"
              className="text-zinc-500 transition-colors hover:text-orange-500"
            >
              Aplicações
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
