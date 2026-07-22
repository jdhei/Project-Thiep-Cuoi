import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";

/**
 * GET /media/[id]
 *
 * Serve uploaded files by WeddingMedia ID.
 * Public endpoint — no auth needed (files are part of published wedding).
 * Caches for 1 year (immutable UUID filenames).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const media = await db.weddingMedia.findUnique({
    where: { id: params.id },
    select: { path: true, mimeType: true },
  });

  if (!media) {
    return new NextResponse("Not found", { status: 404 });
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
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
