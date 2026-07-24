import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { getAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { createSignedObjectUrl, isObjectStorageConfigured } from "@/lib/storage";

/**
 * GET /media/[id]
 *
 * Media của thiệp public chỉ được truy cập khi wedding đã PUBLISHED.
 * Admin đã đăng nhập vẫn xem được media của draft/preview.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const media = await db.weddingMedia.findUnique({
    where: { id: params.id },
    select: {
      path: true,
      mimeType: true,
      wedding: { select: { status: true } },
    },
  });

  if (!media) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (media.wedding.status !== "PUBLISHED" && !(await getAdminSession())) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (isObjectStorageConfigured()) {
    try {
      const signedUrl = await createSignedObjectUrl(media.path, 3600);
      return NextResponse.redirect(signedUrl, {
        status: 307,
        headers: { "Cache-Control": "private, max-age=300" },
      });
    } catch (error) {
      console.error("Signed media URL error:", error);
      return new NextResponse("File not found", { status: 404 });
    }
  }

  // Fallback cho dữ liệu local cũ khi chạy development.
  if (getEnv().NODE_ENV === "production") {
    return new NextResponse("Storage unavailable", { status: 503 });
  }

  const filePath = join(getEnv().UPLOAD_ROOT, media.path);
  try {
    const [fileBuffer, fileStat] = await Promise.all([readFile(filePath), stat(filePath)]);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
