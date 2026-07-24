import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";

/**
 * UTIL-03: GET /api/qr/[slug]
 * Sinh mã QR (PNG) trỏ tới link thiệp công khai /w/[slug].
 * Hỗ trợ ?guest=CODE để nhúng mã mời cá nhân vào QR.
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const wedding = await db.wedding.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: { id: true, slug: true },
  });

  if (!wedding) {
    return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  }

  const env = getEnv();
  const { searchParams } = new URL(request.url);
  const rawGuestCode = searchParams.get("guest")?.trim().toUpperCase();

  // FIX-07: chỉ nhúng ?guest= khi mã mời tồn tại thật cho thiệp này —
  // không phản chiếu input tuỳ ý của người dùng vào QR (tránh sinh QR rác
  // được cache public).
  let guestCode: string | null = null;
  if (rawGuestCode) {
    const guest = await db.guest.findFirst({
      where: { weddingId: wedding.id, invitationCode: rawGuestCode },
      select: { invitationCode: true },
    });
    guestCode = guest?.invitationCode ?? null;
  }

  const base = env.APP_URL.replace(/\/$/, "");
  const target = guestCode
    ? `${base}/w/${wedding.slug}?guest=${encodeURIComponent(guestCode)}`
    : `${base}/w/${wedding.slug}`;

  const png = await QRCode.toBuffer(target, {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#8A6D3B", light: "#FFFFFFFF" },
  });

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="qr-${wedding.slug}.png"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
