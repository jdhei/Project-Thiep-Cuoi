import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton. Tránh tạo nhiều connection khi hot-reload ở dev.
 * Không import trực tiếp vào UI component — dùng qua repository/service.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
