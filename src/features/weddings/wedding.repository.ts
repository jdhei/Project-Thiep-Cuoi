import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { WeddingStatus } from "@/lib/domain";

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

/** FIX-08: hỗ trợ lọc theo trạng thái (WED-TASKS-DETAIL 05e). */
export function listWeddings(status?: WeddingStatus) {
  return db.wedding.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
  });
}

/** FIX-08: đếm thiệp theo từng trạng thái (badge trên tab lọc). */
export async function countWeddingsByStatus(): Promise<Record<string, number>> {
  const groups = await db.wedding.groupBy({ by: ["status"], _count: { _all: true } });
  return Object.fromEntries(groups.map((g) => [g.status, g._count._all]));
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
