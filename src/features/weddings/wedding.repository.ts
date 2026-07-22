import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/**
 * Data-access cho Wedding. Component/UI KHÔNG gọi Prisma trực tiếp — dùng qua đây.
 */

export function findWeddingBySlug(slug: string) {
  return db.wedding.findUnique({ where: { slug } });
}

export function findPublishedWeddingBySlug(slug: string) {
  return db.wedding.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      events: { orderBy: { sortOrder: "asc" } },
      media: { orderBy: { sortOrder: "asc" } },
      wishes: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export type PublishedWedding = NonNullable<Awaited<ReturnType<typeof findPublishedWeddingBySlug>>>;

export function findWeddingById(id: string) {
  return db.wedding.findUnique({
    where: { id },
    include: { events: { orderBy: { sortOrder: "asc" } }, media: { orderBy: { sortOrder: "asc" } } },
  });
}

export function listWeddings() {
  return db.wedding.findMany({ orderBy: { updatedAt: "desc" } });
}

export function createWedding(data: Prisma.WeddingCreateInput) {
  return db.wedding.create({ data });
}

export function updateWedding(id: string, data: Prisma.WeddingUpdateInput) {
  return db.wedding.update({ where: { id }, data });
}

export function findGuestByCode(weddingId: string, invitationCode: string) {
  return db.guest.findFirst({ where: { weddingId, invitationCode } });
}
