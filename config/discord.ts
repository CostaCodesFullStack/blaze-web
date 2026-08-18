export const DISCORD_OAUTH_AUTHORIZE_URL =
  "https://discord.com/oauth2/authorize";

export const DISCORD_OAUTH_TOKEN_URL = "https://discord.com/api/oauth2/token";

export const DISCORD_API_BASE_URL = "https://discord.com/api/v10";

export const DISCORD_SUBSCRIBE_SCOPES = ["bot", "applications.commands"];

// Permissoes minimas e explicitas solicitadas pelo bot na instalacao.
// 2048 = Send Messages. Nenhuma permissao administrativa.
export const DISCORD_SUBSCRIBE_PERMISSIONS = "2048";

export function getDiscordClientId(): string | undefined {
  return process.env.DISCORD_CLIENT_ID;
}

export function getDiscordClientSecret(): string | undefined {
  return process.env.DISCORD_CLIENT_SECRET;
}

export function getDiscordSubscribeRedirectUri(): string {
  return (
    process.env.DISCORD_SUBSCRIBE_REDIRECT_URI ??
    "http://localhost:3000/api/subscribe/discord/callback"
  );
}