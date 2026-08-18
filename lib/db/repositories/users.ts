import { prisma } from "@/lib/db/client";

export type CreateUserInput = {
  discordId: string;
  username: string;
  globalName?: string | null;
  avatar?: string | null;
};

export async function getUserByDiscordId(discordId: string) {
  return prisma.user.findUnique({
    where: { discordId },
    include: {
      subscriptions: true,
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(data: CreateUserInput) {
  return prisma.user.create({
    data: {
      discordId: data.discordId,
      username: data.username,
      globalName: data.globalName ?? null,
      avatar: data.avatar ?? null,
    },
  });
}

export async function upsertUserByDiscordId(data: CreateUserInput) {
  return prisma.user.upsert({
    where: { discordId: data.discordId },
    update: {
      username: data.username,
      globalName: data.globalName ?? null,
      avatar: data.avatar ?? null,
    },
    create: {
      discordId: data.discordId,
      username: data.username,
      globalName: data.globalName ?? null,
      avatar: data.avatar ?? null,
    },
  });
}