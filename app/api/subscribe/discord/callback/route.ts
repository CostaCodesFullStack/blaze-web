import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { upsertGuild, upsertUserGuild } from "@/lib/db/repositories/guilds";
import { upsertGuildApplication } from "@/lib/db/repositories/guild-applications";
import {
  decodeInstallState,
  isInstallStateExpired,
  type InstallState,
} from "@/lib/subscribe/install-state";
import {
  DISCORD_API_BASE_URL,
  DISCORD_OAUTH_TOKEN_URL,
  getDiscordClientId,
  getDiscordClientSecret,
  getDiscordSubscribeRedirectUri,
} from "@/config/discord";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

type DiscordTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  guild?: {
    id?: string;
    name?: string;
    icon?: string | null;
  };
};

type DiscordGuild = {
  id: string;
  name?: string;
  icon?: string | null;
  owner_id?: string;
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const error = params.get("error");
  const stateValue = params.get("state");

  const clientId = getDiscordClientId();
  const clientSecret = getDiscordClientSecret();
  const redirectUri = getDiscordSubscribeRedirectUri();

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Discord OAuth não configurado." },
      { status: 500 },
    );
  }

  const state = stateValue ? decodeInstallState(stateValue) : null;

  if (error) {
    return redirectToSubscribe(request, state, "denied");
  }

  if (!code || !state) {
    return redirectToSubscribe(request, state, "invalid_callback");
  }

  if (isInstallStateExpired(state)) {
    return redirectToSubscribe(request, state, "expired");
  }

  const session = await getSession();

  if (!session || session.id !== state.discordId) {
    return NextResponse.json(
      { error: "Sessão inválida." },
      { status: 403 },
    );
  }

  const application = await getApplicationBySlug(state.slug);

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

  const tokenResponse = await fetch(DISCORD_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    return redirectToSubscribe(request, state, "token_exchange_failed");
  }

  const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;

  if (!tokenData.access_token || !tokenData.token_type) {
    return redirectToSubscribe(request, state, "token_exchange_failed");
  }

  const guildId = tokenData.guild?.id;

  if (!guildId) {
    return redirectToSubscribe(request, state, "no_guild");
  }

  let guildName = tokenData.guild?.name;
  let guildIcon: string | null = tokenData.guild?.icon ?? null;
  let ownerDiscordId: string | null = null;

  const guildResponse = await fetch(
    `${DISCORD_API_BASE_URL}/guilds/${guildId}`,
    {
      headers: {
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
      cache: "no-store",
    },
  );

  if (guildResponse.ok) {
    const guildData = (await guildResponse.json()) as DiscordGuild;
    guildName = guildData.name ?? guildName;
    guildIcon = guildData.icon ?? guildIcon ?? null;

    if (guildData.owner_id) {
      ownerDiscordId = String(guildData.owner_id);
    }
  }

  const persistedGuild = await upsertGuild({
    discordId: guildId,
    name: guildName ?? guildId,
    icon: guildIcon,
    ownerDiscordId,
  });

  await upsertUserGuild(user.id, persistedGuild.id);
  await upsertGuildApplication(persistedGuild.id, application.id);

  console.log("Discord install completed:", {
    discordId: session.id,
    slug: application.slug,
    guildId,
  });

  return NextResponse.redirect(
    new URL(`/subscribe/${application.slug}/success`, request.url),
  );
}

function redirectToSubscribe(
  request: NextRequest,
  state: InstallState | null,
  reason: string,
) {
  if (state && state.slug && SLUG_PATTERN.test(state.slug)) {
    return NextResponse.redirect(
      new URL(
        `/subscribe/${state.slug}?error=${encodeURIComponent(reason)}`,
        request.url,
      ),
    );
  }

  return NextResponse.json(
    { error: "Callback inválido." },
    { status: 400 },
  );
}