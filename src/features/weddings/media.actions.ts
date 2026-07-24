"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { join } from "path";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { deleteObjects, isObjectStorageConfigured } from "@/lib/storage";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteMediaAction(
  weddingId: string,
  mediaId: string,
): Promise<ActionResult> {
  await requireAdminSession();

  const media = await db.weddingMedia.findFirst({
    where: { id: mediaId, weddingId },
  });
  if (!media) return { success: false, error: "Không tìm thấy file" };

  // Xóa DB trước để media không còn được tham chiếu. Object cleanup có thể retry sau.
  await db.weddingMedia.delete({ where: { id: mediaId } });

  try {
    if (isObjectStorageConfigured()) {
      await deleteObjects([media.path]);
    } else if (getEnv().NODE_ENV !== "production") {
      await unlink(join(getEnv().UPLOAD_ROOT, media.path));
    }
  } catch (error) {
    console.error("Media cleanup error:", error);
  }

  revalidatePath(`/admin/weddings/${weddingId}`);
  return { success: true };
}

export async function updateMediaCaptionAction(
  weddingId: string,
  mediaId: string,
  caption: string,
): Promise<ActionResult> {
  await requireAdminSession();

  const media = await db.weddingMedia.findFirst({
    where: { id: mediaId, weddingId },
  });
  if (!media) return { success: false, error: "Không tìm thấy file" };

  await db.weddingMedia.update({
    where: { id: mediaId },
    data: { caption: caption || null },
  });

  revalidatePath(`/admin/weddings/${weddingId}`);
  return { success: true };
}

export async function reorderGalleryAction(
  weddingId: string,
  mediaIds: string[],
): Promise<ActionResult> {
  await requireAdminSession();

  const items = await db.weddingMedia.findMany({
    where: { weddingId, type: "gallery", id: { in: mediaIds } },
    select: { id: true },
  });
  if (items.length !== mediaIds.length) {
    return { success: false, error: "Một số ảnh không thuộc thiệp này" };
  }

  await db.$transaction(
    mediaIds.map((id, index) =>
      db.weddingMedia.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );

  revalidatePath(`/admin/weddings/${weddingId}`);
  return { success: true };
}
