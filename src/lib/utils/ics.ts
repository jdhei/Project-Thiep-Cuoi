/**
 * Tiện ích sinh file iCalendar (RFC 5545) cho lịch sự kiện cưới.
 *
 * FIX-11: Sự kiện dùng giờ địa phương với TZID Asia/Ho_Chi_Minh (kèm block
 * VTIMEZONE) thay vì UTC — lịch hiển thị đúng "10:30" như trên thiệp ở mọi
 * client. Việt Nam dùng offset cố định +07:00 từ 1975, không có DST, nên
 * VTIMEZONE chỉ cần một section STANDARD.
 */

export const VN_TZID = "Asia/Ho_Chi_Minh";
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Block VTIMEZONE cho Asia/Ho_Chi_Minh (offset cố định +07, không DST). */
export const VN_VTIMEZONE_LINES: readonly string[] = [
  "BEGIN:VTIMEZONE",
  `TZID:${VN_TZID}`,
  "BEGIN:STANDARD",
  "DTSTART:19700101T000000",
  "TZOFFSETFROM:+0700",
  "TZOFFSETTO:+0700",
  "TZNAME:+07",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/** Định dạng UTC tuyệt đối: YYYYMMDDTHHMMSSZ (dùng cho DTSTAMP — RFC bắt buộc UTC). */
export function formatIcsUtc(d: Date): string {
  return new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/**
 * Định dạng giờ địa phương VN: YYYYMMDDTHHMMSS (không hậu tố Z).
 * Dùng cùng thuộc tính `;TZID=Asia/Ho_Chi_Minh` trên DTSTART/DTEND.
 */
export function formatIcsLocalVN(d: Date): string {
  return new Date(new Date(d).getTime() + VN_OFFSET_MS)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "");
}

/** Escape ký tự đặc biệt theo RFC 5545 (backslash, chấm phẩy, phẩy, xuống dòng). */
export function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}
