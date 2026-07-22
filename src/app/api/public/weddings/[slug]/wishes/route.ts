import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { wishSubmissionSchema } from "@/features/weddings/rsvp.schemas";

/**
 * POST /api/public/weddings/[slug]/wishes
 *
 * RSVP-05: Validate, filter control chars, create PENDING wish.
 * RSVP-06: Public chỉ hiển thị wish APPROVED (đã handle ở DTO query).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const wedding = await db.wedding.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: { id: true, showWishes: true },
  });

  if (!wedding) {
    return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  }
  if (!wedding.showWishes) {
    return NextResponse.json({ error: "Lời chúc đã tắt" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = wishSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { guestName, content } = parsed.data;

  // Hash IP
  const env = getEnv();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256")
    .update(ip + env.IP_HASH_SECRET)
    .digest("hex");

  const wish = await db.wish.create({
    data: {
      weddingId: wedding.id,
      guestName,
      content,
      status: "PENDING",
      ipHash,
    },
  });

  return NextResponse.json({
    id: wish.id,
    message: "Cảm ơn lời chúc của bạn! Lời chúc sẽ hiển thị sau khi được duyệt.",
  });
}
