import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.application.upsert({
    where: { slug: "blaze-bot" },
    update: {
      name: "Blaze Bot",
      description:
        "Automatize e gerencie sua comunidade através de uma aplicação completa para Discord.",
      active: true,
    },
    create: {
      name: "Blaze Bot",
      slug: "blaze-bot",
      description:
        "Automatize e gerencie sua comunidade através de uma aplicação completa para Discord.",
      active: true,
    },
  });

  await prisma.application.upsert({
    where: { slug: "blaze-tickets" },
    update: {
      name: "Blaze Tickets",
      description:
        "Sistema profissional de atendimento, tickets e gerenciamento de suporte para sua comunidade.",
      active: true,
    },
    create: {
      name: "Blaze Tickets",
      slug: "blaze-tickets",
      description:
        "Sistema profissional de atendimento, tickets e gerenciamento de suporte para sua comunidade.",
      active: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });