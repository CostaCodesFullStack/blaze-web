import { prisma } from "@/lib/db/client";

export type UpsertGuildInput = {
  discordId: string;
  name: string;
  icon?: string | null;
  ownerDiscordId?: string | null;
};

export async function getGuildByDiscordId(discordId: string) {
  return prisma.guild.findUnique({
    where: { discordId },
  });
}

export async function getGuildById(id: string) {
  return prisma.guild.findUnique({
    where: { id },
  });
}

export async function upsertGuild(data: UpsertGuildInput) {
  return prisma.guild.upsert({
    where: { discordId: data.discordId },
    update: {
      name: data.name,
      icon: data.icon ?? null,
      ownerDiscordId: data.ownerDiscordId ?? null,
    },
    create: {
      discordId: data.discordId,
      name: data.name,
      icon: data.icon ?? null,
      ownerDiscordId: data.ownerDiscordId ?? null,
    },
  });
}

export async function getUserGuild(userId: string, guildId: string) {
  return prisma.userGuild.findUnique({
    where: {
      userId_guildId: {
        userId,
        guildId,
      },
    },
  });
}

export async function upsertUserGuild(userId: string, guildId: string) {
  return prisma.userGuild.upsert({
    where: {
      userId_guildId: {
        userId,
        guildId,
      },
    },
    update: {},
    create: {
      userId,
      guildId,
    },
  });
}