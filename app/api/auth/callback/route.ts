import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { upsertUserByDiscordId } from "@/lib/db/repositories/users";

type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      {
        error: "Discord OAuth não configurado.",
      },
      { status: 500 },
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/auth/login?error=discord_denied", request.url),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/auth/login?error=invalid_callback", request.url),
    );
  }

  let redirectTo = "/dashboard";

  try {
    const decodedState = JSON.parse(
      Buffer.from(state, "base64url").toString("utf-8"),
    );

    if (
      typeof decodedState.redirect === "string" &&
      isSafeRedirect(decodedState.redirect)
    ) {
      redirectTo = decodedState.redirect;
    }
  } catch {
    return NextResponse.redirect(
      new URL("/auth/login?error=invalid_state", request.url),
    );
  }

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
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
    return NextResponse.redirect(
      new URL("/auth/login?error=token_exchange_failed", request.url),
    );
  }

  const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
    },
    cache: "no-store",
  });

  if (!userResponse.ok) {
    return NextResponse.redirect(
      new URL("/auth/login?error=user_fetch_failed", request.url),
    );
  }

  const user = (await userResponse.json()) as DiscordUser;

  try {
    await upsertUserByDiscordId({
      discordId: user.id,
      username: user.username,
      globalName: user.global_name,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("Failed to sync user with the database:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=user_sync_failed", request.url),
    );
  }

  await createSession({
    id: user.id,
    username: user.username,
    global_name: user.global_name,
    avatar: user.avatar,
  });

  console.log("Discord user authenticated:", {
    id: user.id,
    username: user.username,
    global_name: user.global_name,
  });

  return NextResponse.redirect(new URL(redirectTo, request.url));
}

function isSafeRedirect(redirect: string) {
  return (
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.includes("\\")
  );
}
