import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { checkWindowLimit } from "@/lib/auth/rate-limit";
import { wishSubmissionSchema } from "@/features/weddings/rsvp.schemas";

/** FIX-06: tối đa 5 lời chúc / 10 phút / IP / thiệp (best-effort, in-memory). */
const WISH_RATE_MAX = 5;
const WISH_RATE_WINDOW_MS = 10 * 60 * 1000;

/**
 * POST /api/public/weddings/[slug]/wishes
 *
 * RSVP-05: Validate, filter control chars, create PENDING wish.
 * RSVP-06: Public chỉ hiển thị wish APPROVED (đã handle ở DTO query).
 * FIX-06: Rate-limit theo ipHash — mỗi POST tạo 1 wish PENDING nên cần
 * hàng rào chống flood DB.
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

  // FIX-06: chặn flood theo IP (hash) trên từng thiệp
  if (!checkWindowLimit(`wish:${wedding.id}:${ipHash}`, WISH_RATE_MAX, WISH_RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Bạn gửi lời chúc quá nhanh. Vui lòng thử lại sau ít phút." },
      { status: 429 },
    );
  }

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
