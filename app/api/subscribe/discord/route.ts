import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { createInstallState } from "@/lib/subscribe/install-state";
import {
  DISCORD_OAUTH_AUTHORIZE_URL,
  DISCORD_SUBSCRIBE_PERMISSIONS,
  DISCORD_SUBSCRIBE_SCOPES,
  getDiscordClientId,
  getDiscordSubscribeRedirectUri,
} from "@/config/discord";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("application");

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: "Aplicação inválida." },
      { status: 400 },
    );
  }

  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?redirect=${encodeURIComponent(`/subscribe/${slug}`)}`,
        request.url,
      ),
    );
  }

  const application = await getApplicationBySlug(slug);

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

  const clientId = getDiscordClientId();

  if (!clientId) {
    return NextResponse.json(
      { error: "Discord OAuth não configurado." },
      { status: 500 },
    );
  }

  const state = createInstallState(slug, session.id);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getDiscordSubscribeRedirectUri(),
    response_type: "code",
    scope: DISCORD_SUBSCRIBE_SCOPES.join(" "),
    permissions: DISCORD_SUBSCRIBE_PERMISSIONS,
    state,
  });

  console.log("Discord install started:", {
    discordId: session.id,
    slug: application.slug,
  });

  return NextResponse.redirect(
    `${DISCORD_OAUTH_AUTHORIZE_URL}?${params.toString()}`,
  );
}