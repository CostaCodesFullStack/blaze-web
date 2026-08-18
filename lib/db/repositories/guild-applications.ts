import { prisma } from "@/lib/db/client";

export async function getGuildApplication(
  guildId: string,
  applicationId: string,
) {
  return prisma.guildApplication.findUnique({
    where: {
      guildId_applicationId: {
        guildId,
        applicationId,
      },
    },
  });
}

export async function upsertGuildApplication(
  guildId: string,
  applicationId: string,
) {
  return prisma.guildApplication.upsert({
    where: {
      guildId_applicationId: {
        guildId,
        applicationId,
      },
    },
    update: {},
    create: {
      guildId,
      applicationId,
    },
  });
}

export async function getGuildApplicationByUserAndApplication(
  userId: string,
  applicationId: string,
) {
  return prisma.guildApplication.findFirst({
    where: {
      applicationId,
      guild: {
        userGuilds: {
          some: { userId },
        },
      },
    },
    include: { guild: true, application: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGuildApplicationsByUser(userId: string) {
  return prisma.guildApplication.findMany({
    where: {
      guild: {
        userGuilds: {
          some: { userId },
        },
      },
    },
    include: { guild: true },
    orderBy: { createdAt: "desc" },
  });
}