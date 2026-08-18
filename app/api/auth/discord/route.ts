import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "Discord OAuth não configurado.",
      },
      { status: 500 },
    );
  }

  const redirect = request.nextUrl.searchParams.get("redirect");

  const redirectTo =
    redirect &&
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.includes("\\")
      ? redirect
      : "/dashboard";

  const state = Buffer.from(
    JSON.stringify({
      redirect: redirectTo,
    }),
  ).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    state,
  });

  const discordUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;

  return NextResponse.redirect(discordUrl);
}
