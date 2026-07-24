import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  VN_TZID,
  VN_VTIMEZONE_LINES,
  formatIcsUtc,
  formatIcsLocalVN,
  escapeIcs,
} from "@/lib/utils/ics";

/**
 * UTIL-02: GET /api/calendar/[slug]
 * Trả về file .ics (iCalendar) chứa các sự kiện của thiệp PUBLISHED.
 * FIX-11: DTSTART/DTEND dùng giờ địa phương + TZID Asia/Ho_Chi_Minh (kèm
 * VTIMEZONE) để mọi calendar client hiển thị đúng giờ như trên thiệp.
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

  // DTSTAMP bắt buộc UTC theo RFC 5545
  const now = formatIcsUtc(new Date());
  const couple = `${wedding.groomName} & ${wedding.brideName}`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Thiep Uoc//Wedding//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...VN_VTIMEZONE_LINES,
  ];

  for (const ev of wedding.events) {
    const start = new Date(ev.startsAt);
    // Mặc định kéo dài 2 tiếng
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.id}@${wedding.slug}`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=${VN_TZID}:${formatIcsLocalVN(start)}`,
      `DTEND;TZID=${VN_TZID}:${formatIcsLocalVN(end)}`,
      `SUMMARY:${escapeIcs(`${ev.title} — ${couple}`)}`,
      `LOCATION:${escapeIcs(ev.address)}`,
      ...(ev.description ? [`DESCRIPTION:${escapeIcs(ev.description)}`] : []),
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
