import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import { getAdminSession } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";
import { db } from "@/lib/db";
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
 * Multipart upload: check admin → validate → write file → insert DB.
 * If DB insert fails → rollback (delete file).
 *
 * Query params: weddingId, type (cover|gallery|music|gift), caption?
 */
export async function POST(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── Parse query ─────────────────────────────────────────────────
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

  // ─── Check wedding exists ────────────────────────────────────────
  const wedding = await db.wedding.findUnique({
    where: { id: weddingId },
    select: { id: true },
  });
  if (!wedding) {
    return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  }

  // ─── Read file from multipart ────────────────────────────────────
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Thiếu file upload" }, { status: 400 });
  }

  // ─── Validate MIME ───────────────────────────────────────────────
  const mimeType = file.type;
  const allowedMimes = ALLOWED_MIME[type as UploadType];
  if (!allowedMimes.includes(mimeType)) {
    return NextResponse.json(
      { error: `MIME type "${mimeType}" không được phép cho ${type}. Cho phép: ${allowedMimes.join(", ")}` },
      { status: 400 },
    );
  }

  // ─── Validate size ──────────────────────────────────────────────
  const maxSize = MAX_SIZE[type as UploadType];
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File quá lớn. Tối đa ${(maxSize / 1024 / 1024).toFixed(0)} MB` },
      { status: 400 },
    );
  }

  // ─── Validate extension (chống extension kép) ───────────────────
  const originalName = file.name || "";
  const dotCount = (originalName.match(/\./g) || []).length;
  if (dotCount > 1) {
    return NextResponse.json(
      { error: "Tên file không hợp lệ (extension kép)" },
      { status: 400 },
    );
  }

  // ─── Generate UUID filename ─────────────────────────────────────
  const ext = MIME_TO_EXT[mimeType] ?? ".bin";
  const uuid = randomUUID();
  const filename = `${uuid}${ext}`;

  const env = getEnv();
  const uploadDir = join(env.UPLOAD_ROOT, "weddings", weddingId, type);
  const filePath = join(uploadDir, filename);
  const relativePath = `weddings/${weddingId}/${type}/${filename}`;

  // ─── Write file ─────────────────────────────────────────────────
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // ─── Insert DB (rollback file on error) ─────────────────────────
  try {
    // For cover type: only one allowed, replace existing
    if (type === "cover" || type === "music") {
      const existing = await db.weddingMedia.findFirst({
        where: { weddingId, type },
      });
      if (existing) {
        // Delete old file
        try {
          await unlink(join(env.UPLOAD_ROOT, existing.path));
        } catch {
          // Old file may already be gone
        }
        await db.weddingMedia.delete({ where: { id: existing.id } });
      }
    }

    // Auto sortOrder for gallery
    let sortOrder = 0;
    if (type === "gallery") {
      const maxSort = await db.weddingMedia.aggregate({
        where: { weddingId, type: "gallery" },
        _max: { sortOrder: true },
      });
      sortOrder = (maxSort._max.sortOrder ?? -1) + 1;
    }

    const media = await db.weddingMedia.create({
      data: {
        weddingId,
        type,
        path: relativePath,
        mimeType,
        sizeBytes: file.size,
        caption: caption || null,
        sortOrder,
      },
    });

    return NextResponse.json({
      id: media.id,
      url: `/media/${media.id}`,
      type,
      mimeType,
      sizeBytes: media.sizeBytes,
    });
  } catch (err) {
    // MED-04: Rollback — delete file if DB insert fails
    try {
      await unlink(filePath);
    } catch {
      // File may not exist
    }
    console.error("Upload DB error:", err);
    return NextResponse.json(
      { error: "Lỗi lưu thông tin file" },
      { status: 500 },
    );
  }
}
