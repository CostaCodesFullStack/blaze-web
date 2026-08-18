import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { getGuildApplicationByUserAndApplication } from "@/lib/db/repositories/guild-applications";
import { requireApplicationAccess } from "@/lib/subscriptions/require-access";
import { upsertBlazeBotConfig } from "@/lib/db/repositories/blaze-bot-config";
import {
  BLAZE_BOT_ALLOWED_KEYS,
  BLAZE_BOT_SLUG,
  validateBotPrefix,
} from "@/lib/blaze-bot/config";

async function resolveAuthorizedGuild() {
  const session = await getSession();

  if (!session) {
    return { status: 401 as const, error: "Não autenticado." };
  }

  const application = await getApplicationBySlug(BLAZE_BOT_SLUG);

  if (!application) {
    return { status: 404 as const, error: "Aplicação não encontrada." };
  }

  if (!application.active) {
    return { status: 403 as const, error: "Esta aplicação está indisponível." };
  }

  const user = await getUserByDiscordId(session.id);

  if (!user) {
    return { status: 403 as const, error: "Usuário não encontrado. Faça login novamente." };
  }

  const check = await requireApplicationAccess(user.id, application.id);

  if (!check.granted) {
    return { status: 403 as const, error: "Sem acesso a esta aplicação." };
  }

  const guildApplication = await getGuildApplicationByUserAndApplication(
    user.id,
    application.id,
  );

  if (!guildApplication) {
    return { status: 404 as const, error: "Conecte um servidor antes de continuar." };
  }

  return {
    status: 200 as const,
    guildId: guildApplication.guildId,
  };
}

export async function GET() {
  const authorized = await resolveAuthorizedGuild();

  if (authorized.status !== 200) {
    return NextResponse.json(
      { error: authorized.error },
      { status: authorized.status },
    );
  }

  const config = await upsertBlazeBotConfig(authorized.guildId, {});

  return NextResponse.json({
    enabled: config.enabled,
    prefix: config.prefix,
  });
}

export async function PATCH(request: NextRequest) {
  const authorized = await resolveAuthorizedGuild();

  if (authorized.status !== 200) {
    return NextResponse.json(
      { error: authorized.error },
      { status: authorized.status },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Requisição inválida." },
      { status: 400 },
    );
  }

  const keys = Object.keys(body);

  for (const key of keys) {
    if (!BLAZE_BOT_ALLOWED_KEYS.has(key)) {
      return NextResponse.json(
        { error: "Campos inválidos." },
        { status: 400 },
      );
    }
  }

  const input: { enabled?: boolean; prefix?: string } = {};

  if ("enabled" in body) {
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { error: "O campo enabled deve ser um booleano." },
        { status: 400 },
      );
    }

    input.enabled = body.enabled;
  }

  if ("prefix" in body) {
    const prefix = validateBotPrefix(body.prefix);

    if (prefix === null) {
      return NextResponse.json(
        { error: "O prefixo deve ter entre 1 e 5 caracteres." },
        { status: 400 },
      );
    }

    input.prefix = prefix;
  }

  if (Object.keys(input).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo para atualizar." },
      { status: 400 },
    );
  }

  const config = await upsertBlazeBotConfig(authorized.guildId, input);

  return NextResponse.json({
    enabled: config.enabled,
    prefix: config.prefix,
  });
}
