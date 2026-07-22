import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * UTIL-02: GET /api/calendar/[slug]
 * Trả về file .ics (iCalendar) chứa các sự kiện của thiệp PUBLISHED.
 */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const wedding = await db.wedding.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: {
      slug: true,
      groomName: true,
      brideName: true,
      events: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          startsAt: true,
          address: true,
          description: true,
        },
      },
    },
  });

  if (!wedding) {
    return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  }

  // Định dạng thời gian UTC: YYYYMMDDTHHMMSSZ
  const fmt = (d: Date) =>
    new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  // Escape ký tự đặc biệt theo RFC 5545
  const esc = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

  const now = fmt(new Date());
  const couple = `${wedding.groomName} & ${wedding.brideName}`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Thiep Uoc//Wedding//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const ev of wedding.events) {
    const start = new Date(ev.startsAt);
    // Mặc định kéo dài 2 tiếng
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.id}@${wedding.slug}`,
      `DTSTAMP:${now}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${esc(`${ev.title} — ${couple}`)}`,
      `LOCATION:${esc(ev.address)}`,
      ...(ev.description ? [`DESCRIPTION:${esc(ev.description)}`] : []),
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  // iCalendar dùng CRLF
  const ics = lines.join("\r\n") + "\r\n";

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${wedding.slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
