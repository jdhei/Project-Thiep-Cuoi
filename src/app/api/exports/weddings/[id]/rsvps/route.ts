import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

/**
 * UTIL-01: GET /api/exports/weddings/[id]/rsvps
 * Xuất danh sách RSVP ra CSV (UTF-8 có BOM để Excel đọc đúng tiếng Việt).
 * Chỉ admin đã đăng nhập.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const wedding = await db.wedding.findUnique({
    where: { id: params.id },
    select: {
      slug: true,
      groomName: true,
      brideName: true,
      rsvps: {
        orderBy: { createdAt: "desc" },
        select: {
          fullName: true,
          phone: true,
          attendance: true,
          numberOfPeople: true,
          message: true,
          createdAt: true,
          guest: { select: { fullName: true, invitationCode: true } },
        },
      },
    },
  });

  if (!wedding) {
    return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  }

  const attendanceLabel: Record<string, string> = {
    ATTENDING: "Tham dự",
    NOT_ATTENDING: "Không tham dự",
    MAYBE: "Chưa chắc chắn",
  };

  /**
   * FIX-05: Escape CSV + chống formula injection.
   * Excel/LibreOffice diễn giải ô bắt đầu bằng = @ (và + - trong một số
   * phiên bản) là công thức → kẻ xấu có thể nhét "=cmd|..." vào tên/lời nhắn.
   * Quy tắc: ô bắt đầu bằng = @ tab CR luôn được chèn dấu nháy đơn;
   * ô bắt đầu bằng + hoặc - chỉ được chèn khi KHÔNG phải dạng số/điện thoại
   * (để "+84 912..." không bị biến dạng).
   */
  const esc = (v: unknown) => {
    let s = v == null ? "" : String(v);
    const phoneOrNumberLike = /^[+-][\d\s().-]*$/.test(s);
    if (/^[=@\t\r]/.test(s) || (/^[+-]/.test(s) && !phoneOrNumberLike)) {
      s = `'${s}`;
    }
    return `"${s.replace(/"/g, '""')}"`;
  };

  const header = [
    "Họ tên",
    "Số điện thoại",
    "Trạng thái",
    "Số người",
    "Lời nhắn",
    "Khách mời (mã)",
    "Thời gian",
  ];

  const rows = wedding.rsvps.map((r) =>
    [
      r.fullName,
      r.phone ?? "",
      attendanceLabel[r.attendance] ?? r.attendance,
      r.numberOfPeople,
      (r.message ?? "").replace(/\r?\n/g, " "),
      r.guest ? `${r.guest.fullName} (${r.guest.invitationCode})` : "",
      new Date(r.createdAt).toISOString(),
    ]
      .map(esc)
      .join(","),
  );

  const totalAttending = wedding.rsvps
    .filter((r) => r.attendance === "ATTENDING")
    .reduce((sum, r) => sum + r.numberOfPeople, 0);

  const summary = esc(`Tổng người tham dự: ${totalAttending}`);

  // BOM + CRLF để Excel Windows đọc UTF-8 chuẩn
  const csv = "\uFEFF" + [header.map(esc).join(","), ...rows, "", summary].join("\r\n");

  const filename = `rsvps-${wedding.slug}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
