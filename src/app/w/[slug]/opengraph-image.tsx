import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

/**
 * UTIL-04: OG image động cho link thiệp khi chia sẻ (Zalo/Facebook/Messenger...).
 */
export const runtime = "nodejs";
export const alt = "Thiệp cưới";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const wedding = await db.wedding.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: { groomName: true, brideName: true, weddingDate: true, title: true },
  });

  const groom = wedding?.groomName ?? "";
  const bride = wedding?.brideName ?? "";
  const dateStr = wedding?.weddingDate
    ? new Date(wedding.weddingDate).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fdf8f0 0%, #f3e4c8 100%)",
          color: "#8A6D3B",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 6, opacity: 0.75 }}>
          TRÂN TRỌNG KÍNH MỜI
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, marginTop: 24, textAlign: "center" }}>
          {groom} &amp; {bride}
        </div>
        {dateStr && (
          <div style={{ fontSize: 40, marginTop: 28, opacity: 0.85 }}>♡ {dateStr} ♡</div>
        )}
        <div style={{ fontSize: 28, marginTop: 40, opacity: 0.6 }}>Thiệp Ước</div>
      </div>
    ),
    { ...size },
  );
}
