import { prisma } from "@/lib/db/client";

export async function getApplications({ onlyActive = true } = {}) {
  return prisma.application.findMany({
    where: onlyActive ? { active: true } : undefined,
    orderBy: { createdAt: "asc" },
  });
}

export async function getApplicationBySlug(slug: string) {
  return prisma.application.findUnique({
    where: { slug },
  });
}

export async function getApplicationById(id: string) {
  return prisma.application.findUnique({
    where: { id },
  });
}