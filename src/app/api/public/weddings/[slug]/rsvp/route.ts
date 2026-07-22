import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { rsvpSubmissionSchema } from "@/features/weddings/rsvp.schemas";

/**
 * POST /api/public/weddings/[slug]/rsvp
 *
 * RSVP-02: Idempotent submission via submissionKey.
 * RSVP-03: Hash IP with SHA-256 + IP_HASH_SECRET.
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

  // GUEST-03/04: Nếu có mã mời hợp lệ → liên kết guest & giới hạn số người.
  let guestId: string | null = null;
  if (invitationCode) {
    const guest = await db.guest.findFirst({
      where: { weddingId: wedding.id, invitationCode: invitationCode.toUpperCase() },
      select: { id: true, maximumPeople: true },
    });
    if (guest) {
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
  }

  // Hash IP
  const env = getEnv();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256")
    .update(ip + env.IP_HASH_SECRET)
    .digest("hex");

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
