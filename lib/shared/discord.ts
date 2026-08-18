const DISCORD_CDN_BASE = "https://cdn.discordapp.com";

export function buildGuildIconUrl(discordId: string, icon: string): string {
  return `${DISCORD_CDN_BASE}/icons/${discordId}/${icon}.png?size=128`;
}