import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { getGuildApplicationByUserAndApplication } from "@/lib/db/repositories/guild-applications";
import { getBlazeBotConfig } from "@/lib/db/repositories/blaze-bot-config";
import { requireApplicationAccess } from "@/lib/subscriptions/require-access";
import { BLAZE_BOT_SLUG } from "@/lib/blaze-bot/config";
import { checkBlazeBotConnection } from "@/lib/blaze-bot/client";

type ConnectionStatusPayload = {
  connected: boolean;
  status: "online" | "offline";
  serverName: string | null;
  reason:
    | "not-configured"
    | "disabled"
    | "timeout"
    | "unavailable"
    | "invalid-response"
    | null;
};

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 },
    );
  }

  const application = await getApplicationBySlug(BLAZE_BOT_SLUG);

  if (!application) {
    return NextResponse.json(
      { error: "Aplicação não encontrada." },
      { status: 404 },
    );
  }

  if (!application.active) {
    return NextResponse.json(
      { error: "Esta aplicação está indisponível." },
      { status: 403 },
    );
  }

  const user = await getUserByDiscordId(session.id);

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado. Faça login novamente." },
      { status: 403 },
    );
  }

  const access = await requireApplicationAccess(user.id, application.id);

  if (!access.granted) {
    return NextResponse.json(
      { error: "Sem acesso a esta aplicação." },
      { status: 403 },
    );
  }

  const guildApplication = await getGuildApplicationByUserAndApplication(
    user.id,
    application.id,
  );

  if (!guildApplication) {
    return NextResponse.json(
      { error: "Nenhum servidor vinculado." },
      { status: 403 },
    );
  }

  const guild = guildApplication.guild;
  const serverName = guild.name;

  const config = await getBlazeBotConfig(guild.id);

  if (!config) {
    return NextResponse.json({
      connected: false,
      status: "offline",
      serverName,
      reason: "not-configured",
    } satisfies ConnectionStatusPayload);
  }

  if (!config.enabled) {
    return NextResponse.json({
      connected: false,
      status: "offline",
      serverName,
      reason: "disabled",
    } satisfies ConnectionStatusPayload);
  }

  const bot = await checkBlazeBotConnection();

  return NextResponse.json({
    connected: bot.ok,
    status: bot.status,
    serverName,
    reason: bot.ok ? null : bot.reason,
  } satisfies ConnectionStatusPayload);
}