export const BLAZE_BOT_SLUG = "blaze-bot";

export const BLAZE_BOT_ALLOWED_KEYS: ReadonlySet<string> = new Set([
  "enabled",
  "prefix",
]);

export const BLAZE_BOT_MAX_PREFIX_LENGTH = 5;

export function validateBotPrefix(prefix: unknown): string | null {
  if (typeof prefix !== "string") {
    return null;
  }

  const trimmed = prefix.trim();

  if (trimmed.length < 1 || trimmed.length > BLAZE_BOT_MAX_PREFIX_LENGTH) {
    return null;
  }

  return trimmed;
}