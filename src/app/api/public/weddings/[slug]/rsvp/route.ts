import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { checkWindowLimit } from "@/lib/auth/rate-limit";
import { rsvpSubmissionSchema } from "@/features/weddings/rsvp.schemas";

/** FIX-06: tối đa 10 lần gửi RSVP / 10 phút / IP / thiệp (best-effort, in-memory). */
const RSVP_RATE_MAX = 10;
const RSVP_RATE_WINDOW_MS = 10 * 60 * 1000;

/**
 * POST /api/public/weddings/[slug]/rsvp
 *
 * RSVP-02: Idempotent submission via submissionKey.
 * RSVP-03: Hash IP with SHA-256 + IP_HASH_SECRET.
 * FIX-04: Mã mời sai → 400 (không âm thầm bỏ qua giới hạn khách mời).
 * FIX-06: Rate-limit theo ipHash.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  // Find published wedding
  const wedding = await db.wedding.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: { id: true, showRsvp: true },
  });

  if (!wedding) {
    return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  }
  if (!wedding.showRsvp) {
    return NextResponse.json({ error: "RSVP đã tắt" }, { status: 403 });
  }

  // Parse & validate body
  const body = await request.json().catch(() => null);
  const parsed = rsvpSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { fullName, phone, attendance, numberOfPeople, message, invitationCode } =
    parsed.data;

  // GUEST-03/04: Nếu có mã mời → mã PHẢI hợp lệ; liên kết guest & giới hạn số người.
  let guestId: string | null = null;
  if (invitationCode) {
    const guest = await db.guest.findFirst({
      where: { weddingId: wedding.id, invitationCode: invitationCode.toUpperCase() },
      select: { id: true, maximumPeople: true },
    });
    // FIX-04: trước đây mã sai bị bỏ qua thầm lặng → RSVP như khách vãng lai
    // (lách được giới hạn maximumPeople). Giờ trả lỗi rõ ràng.
    if (!guest) {
      return NextResponse.json(
        { error: "Mã mời không hợp lệ. Vui lòng kiểm tra lại đường link trong thư mời." },
        { status: 400 },
      );
    }
    guestId = guest.id;
    if (numberOfPeople > guest.maximumPeople) {
      return NextResponse.json(
        {
          error: `Số người vượt quá giới hạn cho phép (tối đa ${guest.maximumPeople})`,
        },
        { status: 400 },
      );
    }
  }

  // Hash IP
  const env = getEnv();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256")
    .update(ip + env.IP_HASH_SECRET)
    .digest("hex");

  // FIX-06: chặn flood theo IP (hash) trên từng thiệp
  if (!checkWindowLimit(`rsvp:${wedding.id}:${ipHash}`, RSVP_RATE_MAX, RSVP_RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút." },
      { status: 429 },
    );
  }

  // Generate submissionKey: hash of weddingId + fullName (lowercase) + ipHash
  const submissionKey = createHash("sha256")
    .update(`${wedding.id}:${fullName.toLowerCase()}:${ipHash}`)
    .digest("hex")
    .slice(0, 32);

  // Upsert — idempotent by submissionKey
  const rsvp = await db.rsvp.upsert({
    where: {
      weddingId_submissionKey: {
        weddingId: wedding.id,
        submissionKey,
      },
    },
    update: {
      fullName,
      phone: phone || null,
      attendance,
      numberOfPeople,
      message: message || null,
      ipHash,
      guestId,
    },
    create: {
      weddingId: wedding.id,
      fullName,
      phone: phone || null,
      attendance,
      numberOfPeople,
      message: message || null,
      submissionKey,
      ipHash,
      guestId,
    },
  });

  return NextResponse.json({
    id: rsvp.id,
    attendance: rsvp.attendance,
    numberOfPeople: rsvp.numberOfPeople,
    message: "Cảm ơn bạn đã xác nhận!",
  });
}
