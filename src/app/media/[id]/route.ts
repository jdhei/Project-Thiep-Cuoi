import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getAdminSession } from "@/lib/auth/session";

/**
 * GET /media/[id]
 *
 * Serve uploaded files by WeddingMedia ID.
 *
 * FIX-03: Chỉ public khi wedding đã PUBLISHED. Media của thiệp
 * DRAFT/ARCHIVED chỉ admin xem được (phục vụ /preview/[id]) — người
 * ngoài nhận 404 (không phân biệt "không tồn tại" vs "chưa publish").
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

  const isPublished = media.wedding.status === "PUBLISHED";
  if (!isPublished) {
    const session = await getAdminSession();
    if (!session) {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const env = getEnv();
  const filePath = join(env.UPLOAD_ROOT, media.path);

  try {
    const [fileBuffer, fileStat] = await Promise.all([
      readFile(filePath),
      stat(filePath),
    ]);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": String(fileStat.size),
        // Thiệp published: cache dài hạn (filename UUID bất biến).
        // Thiệp chưa publish (admin preview): không cache công cộng.
        "Cache-Control": isPublished
          ? "public, max-age=31536000, immutable"
          : "private, no-store",
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
