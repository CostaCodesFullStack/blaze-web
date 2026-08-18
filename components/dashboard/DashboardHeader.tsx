import Image from "next/image";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

type DashboardHeaderProps = {
  userId: string;
  username: string;
  avatar: string | null;
};

export default function DashboardHeader({
  userId,
  username,
  avatar,
}: DashboardHeaderProps) {
  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=128`
    : null;

  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/50">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-black text-white">
            B
          </span>

          <span className="font-bold tracking-tight text-zinc-950 dark:text-white">
            Blaze
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`Avatar de ${username}`}
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-full"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                <User className="h-4 w-4" />
              </div>
            )}

            <span className="hidden max-w-32 truncate text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:inline">
              {username}
            </span>
          </div>

          <a
            href="/api/auth/logout"
            className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-black/10 px-2 text-sm text-zinc-600 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 sm:px-3"
          >
            <LogOut className="h-4 w-4" />

            <span className="hidden sm:inline">Sair</span>
          </a>
        </div>
      </div>
    </header>
  );
}
