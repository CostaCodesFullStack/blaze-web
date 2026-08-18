"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Server as ServerIcon,
  Loader2,
} from "lucide-react";

const APPLICATION_SLUG = "blaze-bot";

type GuildSummary = {
  discordId: string;
  name: string;
  icon: string | null;
};

type SaveState = "idle" | "saving" | "success" | "error";

export default function BlazeBotSettings({
  applicationName,
  enabled,
  prefix,
  guild,
  guildIconUrl,
  hasGuild,
}: {
  applicationName: string;
  enabled: boolean;
  prefix: string;
  guild: GuildSummary | null;
  guildIconUrl: string | null;
  hasGuild: boolean;
}) {
  const [botEnabled, setBotEnabled] = useState(enabled);
  const [botPrefix, setBotPrefix] = useState(prefix);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedPrefix = botPrefix.trim();

  const isValid = useMemo(() => {
    return trimmedPrefix.length >= 1 && trimmedPrefix.length <= 5;
  }, [trimmedPrefix]);

  const hasChanges =
    botEnabled !== enabled || botPrefix.trim() !== prefix;

  async function handleSave() {
    if (!isValid) {
      setSaveState("error");
      setErrorMessage("O prefixo deve ter entre 1 e 5 caracteres.");
      return;
    }

    setSaveState("saving");
    setErrorMessage("");

    try {
      const response = await fetch(
        "/api/applications/blaze-bot/settings",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enabled: botEnabled,
            prefix: botPrefix.trim(),
          }),
        },
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        setSaveState("error");
        setErrorMessage(
          body?.error ?? "Não foi possível salvar as alterações. Tente novamente.",
        );
        return;
      }

      setSaveState("success");

      setTimeout(() => {
        if (saveState === "success") {
          setSaveState("idle");
        }
      }, 3000);
    } catch {
      setSaveState("error");
      setErrorMessage(
        "Não foi possível salvar as alterações. Tente novamente.",
      );
    }
  }

  if (!hasGuild) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-10">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-500/10 text-zinc-500">
            <ServerIcon className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Conecte seu servidor primeiro
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Para configurar as definições do Blaze Bot no servidor, é necessário
            autorizar a aplicação em um servidor do Discord.
          </p>
        </div>

        <div className="mt-6">
          <Link
            href={`/api/subscribe/discord?application=${encodeURIComponent(APPLICATION_SLUG)}`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-400 hover:shadow-orange-500/20"
          >
            Conectar servidor
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-8">
        <p className="text-sm font-medium text-orange-500">{applicationName}</p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Configurações
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Configure o comportamento básico do Blaze Bot no seu servidor.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Server */}
        <section className="flex items-center gap-4 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20">
          {guildIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={guildIconUrl}
              alt={`Ícone do servidor ${guild?.name ?? ""}`}
              className="h-12 w-12 shrink-0 rounded-full"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <ServerIcon className="h-6 w-6" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Servidor conexão
            </p>

            <p className="mt-0.5 truncate font-semibold text-zinc-950 dark:text-white">
              {guild?.name ?? "Servidor"}
            </p>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Discord
            </p>
          </div>
        </section>

        {/* Bot status */}
        <section className="flex items-center gap-4 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              botEnabled
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-zinc-500/10 text-zinc-500"
            }`}
          >
            <Bot className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Status do bot
            </p>

            <p className="mt-0.5 flex items-center gap-2 truncate font-semibold text-zinc-950 dark:text-white">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  botEnabled ? "bg-emerald-500" : "bg-zinc-400"
                }`}
              />
              {botEnabled ? "Ativo no servidor" : "Desativado"}
            </p>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {botEnabled
                ? "O bot responde aos comandos"
                : "O bot ignora todos os comandos"}
            </p>
          </div>
        </section>
      </div>

      {/* Bot config form */}
      <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-8">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Comportamento do bot
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Ajuste como o Blaze Bot responde às mensagens no seu servidor.
        </p>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:border sm:border-black/5 sm:bg-black/[0.02] sm:p-5 sm:dark:border-white/5 sm:dark:bg-white/[0.02]">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Habilitar bot
            </p>

            <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
              Quando desativado, o Blaze Bot ignora todos os comandos no
              servidor.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={botEnabled}
            aria-label="Habilitar bot"
            onClick={() => {
              setBotEnabled((value) => !value);
              setSaveState("idle");
            }}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              botEnabled ? "bg-orange-500" : "bg-zinc-400 dark:bg-zinc-600"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                botEnabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:border sm:border-black/5 sm:bg-black/[0.02] sm:p-5 sm:dark:border-white/5 sm:dark:bg-white/[0.02]">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="bot-prefix"
              className="text-sm font-semibold text-zinc-900 dark:text-white"
            >
              Prefixo de comandos
            </label>

            <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
              O caractere usado antes dos comandos. Use entre 1 e 5 caracteres.
            </p>
          </div>

          <input
            id="bot-prefix"
            type="text"
            value={botPrefix}
            maxLength={5}
            onChange={(event) => {
              setBotPrefix(event.target.value);
              setSaveState("idle");
            }}
            className="h-11 w-full shrink-0 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-zinc-900 outline-none transition-colors focus:border-orange-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white sm:w-32"
            data-testid="bot-prefix"
          />
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-5 items-center text-sm">
            {saveState === "saving" ? (
              <span className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </span>
            ) : saveState === "success" ? (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Alterações salvas
              </span>
            ) : saveState === "error" ? (
              <span className="font-medium text-red-600 dark:text-red-400">
                {errorMessage}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving" || !isValid || !hasChanges}
            data-testid="save-settings"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition-all hover:bg-orange-400 hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:border disabled:border-zinc-500/20 disabled:bg-zinc-500/5 disabled:text-zinc-500 disabled:shadow-none dark:disabled:text-zinc-400"
          >
            Salvar alterações
          </button>
        </div>
      </section>
    </div>
  );
}