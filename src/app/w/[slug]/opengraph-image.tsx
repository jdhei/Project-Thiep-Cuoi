import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";

/**
 * UTIL-04: OG image động cho link thiệp khi chia sẻ (Zalo/Facebook/Messenger...).
 *
 * FIX-10: nếu thiệp có ảnh bìa (WeddingMedia type="cover") thì dùng ảnh thật
 * làm nền (kèm lớp phủ tối để chữ dễ đọc); chưa có cover thì giữ nền gradient
 * Classic Gold như cũ. Ảnh đọc trực tiếp từ UPLOAD_ROOT và nhúng dạng data URI
 * (không phụ thuộc APP_URL khi render).
 */
export const runtime = "nodejs";
export const alt = "Thiệp cưới";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadCoverDataUri(path: string, mimeType: string): Promise<string | null> {
  try {
    const buf = await readFile(join(getEnv().UPLOAD_ROOT, path));
    // Giới hạn 8MB cho an toàn bộ nhớ khi render OG
    if (buf.length > 8 * 1024 * 1024) return null;
    return `data:${mimeType};base64,${buf.toString("base64")}`;
  } catch {
    return null; // file mất/hỏng → fallback gradient, không làm vỡ OG
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const wedding = await db.wedding.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: {
      groomName: true,
      brideName: true,
      weddingDate: true,
      title: true,
      media: {
        where: { type: "cover" },
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { path: true, mimeType: true },
      },
    },
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

  const cover = wedding?.media[0];
  const coverSrc = cover ? await loadCoverDataUri(cover.path, cover.mimeType) : null;

  // Satori (next/og) yêu cầu mọi div >1 child phải display:flex và đếm cả
  // child điều kiện `{x && ...}` — nên tách hẳn 2 nhánh render, không nhúng
  // điều kiện boolean vào cây JSX.
  const content = (hasCover: boolean) => (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: hasCover ? "#FFF8EC" : "#8A6D3B",
        fontFamily: "serif",
      }}
    >
      <div style={{ fontSize: 34, letterSpacing: 6, opacity: 0.85, display: "flex" }}>
        TRÂN TRỌNG KÍNH MỜI
      </div>
      <div
        style={{
          fontSize: 96,
          fontWeight: 700,
          marginTop: 24,
          textAlign: "center",
          display: "flex",
        }}
      >
        {`${groom} & ${bride}`}
      </div>
      {/* Dùng "·" thay "♡" — font mặc định của satori không có glyph trái tim (render ô vuông) */}
      <div style={{ fontSize: 40, marginTop: 28, opacity: 0.9, display: "flex" }}>
        {dateStr ? `· ${dateStr} ·` : " "}
      </div>
      <div style={{ fontSize: 28, marginTop: 40, opacity: 0.75, display: "flex" }}>
        Thiệp Ước
      </div>
    </div>
  );

  if (coverSrc) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
            background: "#1a1208",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverSrc}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              display: "flex",
              background:
                "linear-gradient(180deg, rgba(20,14,5,0.35) 0%, rgba(20,14,5,0.55) 100%)",
            }}
          />
          {content(true)}
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #fdf8f0 0%, #f3e4c8 100%)",
        }}
      >
        {content(false)}
      </div>
    ),
    { ...size },
  );
}
