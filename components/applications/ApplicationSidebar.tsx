import Link from "next/link";
import {
  LayoutDashboard,
  Server as ServerIcon,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  available: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Visão geral",
    icon: LayoutDashboard,
    href: "/applications/blaze-bot",
    available: true,
  },
  {
    label: "Configurações",
    icon: Settings,
    href: "/applications/blaze-bot/settings",
    available: true,
  },
  {
    label: "Servidor",
    icon: ServerIcon,
    available: false,
  },
];

export default function ApplicationSidebar({
  active = "/applications/blaze-bot",
}: {
  active?: string;
}) {
  return (
    <nav
      aria-label="Navegação da aplicação"
      className="flex gap-2 overflow-x-auto lg:flex-col"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;

        if (!item.available || !item.href) {
          return (
            <span
              key={item.label}
              className="flex shrink-0 cursor-not-allowed items-center gap-3 rounded-xl border border-zinc-500/10 bg-zinc-500/5 px-4 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 lg:w-full"
              aria-disabled="true"
            >
              <Icon className="h-4 w-4 shrink-0" />

              <span className="min-w-0 flex-1 truncate">{item.label}</span>

              <span className="shrink-0 rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Em breve
              </span>
            </span>
          );
        }

        const isActive = item.href === active;

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all lg:w-full ${
              isActive
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/10"
                : "border border-zinc-500/10 bg-white/80 text-zinc-600 hover:border-orange-500/30 hover:text-orange-500 dark:bg-white/[0.03] dark:text-zinc-300"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />

            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}