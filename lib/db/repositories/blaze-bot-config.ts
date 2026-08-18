import { prisma } from "@/lib/db/client";

export type BlazeBotConfigInput = {
  prefix?: string;
  enabled?: boolean;
};

export async function getBlazeBotConfig(guildId: string) {
  return prisma.blazeBotConfig.findUnique({
    where: { guildId },
  });
}

export async function createDefaultBlazeBotConfig(guildId: string) {
  return prisma.blazeBotConfig.create({
    data: {
      guildId,
      enabled: true,
      prefix: "!",
    },
  });
}

export async function upsertBlazeBotConfig(
  guildId: string,
  input: BlazeBotConfigInput,
) {
  return prisma.blazeBotConfig.upsert({
    where: { guildId },
    update: {
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.prefix !== undefined ? { prefix: input.prefix } : {}),
    },
    create: {
      guildId,
      enabled: input.enabled ?? true,
      prefix: input.prefix ?? "!",
    },
  });
}

export async function updateBlazeBotConfig(
  guildId: string,
  input: BlazeBotConfigInput,
) {
  return prisma.blazeBotConfig.update({
    where: { guildId },
    data: {
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.prefix !== undefined ? { prefix: input.prefix } : {}),
    },
  });
}