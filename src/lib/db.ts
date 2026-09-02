import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  // Fail faster in dev so pages can fall back to the local menu
  if (url.includes("connect_timeout=")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=10`;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: databaseUrl() ? { db: { url: databaseUrl() } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
