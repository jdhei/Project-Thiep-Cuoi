import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { deleteObjects, isObjectStorageConfigured, uploadObject } from "@/lib/storage";
import {
  uploadQuerySchema,
  ALLOWED_MIME,
  MAX_SIZE,
  MIME_TO_EXT,
  type UploadType,
} from "@/features/weddings/upload.schemas";

/**
 * POST /api/uploads
 *
 * Upload file vào Supabase Storage, sau đó tạo WeddingMedia.
 * Cover/music mới được tạo trước; bản cũ chỉ bị xóa sau khi DB update thành công.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isObjectStorageConfigured()) {
    return NextResponse.json(
      { error: "Supabase Storage chưa được cấu hình" },
      { status: 503 },
    );
  }

  const { searchParams } = request.nextUrl;
  const query = uploadQuerySchema.safeParse({
    weddingId: searchParams.get("weddingId"),
    type: searchParams.get("type"),
    caption: searchParams.get("caption") || undefined,
  });

  if (!query.success) {
    return NextResponse.json(
      { error: "Tham số không hợp lệ", details: query.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { weddingId, type, caption } = query.data;
  const wedding = await db.wedding.findUnique({
    where: { id: weddingId },
    select: { id: true },
  });
  if (!wedding) {
    return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Thiếu file upload" }, { status: 400 });
  }

  const mimeType = file.type;
  const allowedMimes = ALLOWED_MIME[type as UploadType];
  if (!allowedMimes.includes(mimeType)) {
    return NextResponse.json(
      { error: `MIME type "${mimeType}" không được phép cho ${type}` },
      { status: 400 },
    );
  }

  const maxSize = MAX_SIZE[type as UploadType];
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File quá lớn. Tối đa ${(maxSize / 1024 / 1024).toFixed(0)} MB` },
      { status: 400 },
    );
  }

  const originalName = file.name || "";
  const dotCount = (originalName.match(/\./g) || []).length;
  if (dotCount > 1) {
    return NextResponse.json(
      { error: "Tên file không hợp lệ (extension kép)" },
      { status: 400 },
    );
  }

  const ext = MIME_TO_EXT[mimeType] ?? ".bin";
  const objectPath = `weddings/${weddingId}/${type}/${randomUUID()}${ext}`;

  try {
    await uploadObject(objectPath, await file.arrayBuffer(), mimeType);

    const existing =
      type === "cover" || type === "music"
        ? await db.weddingMedia.findFirst({ where: { weddingId, type } })
        : null;

    let sortOrder = 0;
    if (type === "gallery") {
      const maxSort = await db.weddingMedia.aggregate({
        where: { weddingId, type: "gallery" },
        _max: { sortOrder: true },
      });
      sortOrder = (maxSort._max.sortOrder ?? -1) + 1;
    }

    const media = await db.$transaction(async (tx) => {
      const created = await tx.weddingMedia.create({
        data: {
          weddingId,
          type,
          path: objectPath,
          mimeType,
          sizeBytes: file.size,
          caption: caption || null,
          sortOrder,
        },
      });

      if (existing) {
        await tx.weddingMedia.delete({ where: { id: existing.id } });
      }

      return created;
    });

    if (existing) {
      await deleteObjects([existing.path]).catch((error) => {
        console.error("Không xóa được object cũ:", error);
      });
    }

    return NextResponse.json({
      id: media.id,
      url: `/media/${media.id}`,
      type,
      mimeType,
      sizeBytes: media.sizeBytes,
    });
  } catch (error) {
    await deleteObjects([objectPath]).catch(() => undefined);
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Lỗi lưu file" }, { status: 500 });
  }
}
