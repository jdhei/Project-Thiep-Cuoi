"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { join } from "path";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

// ─── Delete Media ────────────────────────────────────────────────────

export async function deleteMediaAction(
  weddingId: string,
  mediaId: string,
): Promise<ActionResult> {
  await requireAdminSession();

  const media = await db.weddingMedia.findFirst({
    where: { id: mediaId, weddingId },
  });
  if (!media) return { success: false, error: "Không tìm thấy file" };

  // Delete DB record
  await db.weddingMedia.delete({ where: { id: mediaId } });

  // Delete file from disk
  try {
    const env = getEnv();
    await unlink(join(env.UPLOAD_ROOT, media.path));
  } catch {
    // File may already be gone — not critical
  }

  revalidatePath(`/admin/weddings/${weddingId}`);
  return { success: true };
}

// ─── Update Media Caption ───────────────────────────────────────────

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

// ─── Reorder Gallery ────────────────────────────────────────────────

export async function reorderGalleryAction(
  weddingId: string,
  mediaIds: string[],
): Promise<ActionResult> {
  await requireAdminSession();

  // Verify all media belong to this wedding
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
