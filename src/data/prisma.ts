import { PrismaClient } from "@prisma/client";

// Singleton estándar de Next.js: evita abrir una conexión nueva por cada
// hot-reload en dev. Ver https://www.prisma.io/docs/guides/nextjs
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
