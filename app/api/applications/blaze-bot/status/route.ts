import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { BLAZE_BOT_SLUG } from "@/lib/blaze-bot/config";
import { getBlazeBotStatus } from "@/lib/blaze-bot/status";

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

  const user = await getUserByDiscordId(session.id);

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado. Faça login novamente." },
      { status: 403 },
    );
  }

  const status = await getBlazeBotStatus(user.id, application.id);

  if (!status.applicationActive) {
    return NextResponse.json(
      { error: "Esta aplicação está indisponível." },
      { status: 403 },
    );
  }

  if (!status.accessGranted) {
    return NextResponse.json(
      { error: "Sem acesso a esta aplicação." },
      { status: 403 },
    );
  }

  if (!status.hasGuildApplication) {
    return NextResponse.json(
      { error: "Nenhum servidor vinculado." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    status: status.status,
    connected: status.connected,
    applicationActive: status.applicationActive,
    accessGranted: status.accessGranted,
    subscriptionStatus: status.subscriptionStatus,
    hasGuildApplication: status.hasGuildApplication,
    guild: status.guild,
    hasConfig: status.hasConfig,
    configEnabled: status.configEnabled,
    configPrefix: status.configPrefix,
  });
}