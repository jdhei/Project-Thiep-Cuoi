/**
 * Tiện ích ngày giờ theo múi giờ Việt Nam (Asia/Ho_Chi_Minh, UTC+07, không DST).
 *
 * BỐI CẢNH (FIX-14/15/16): server production (Vercel) chạy múi giờ UTC nên mọi
 * cách format "ngầm định múi giờ runtime" (date-fns `format`, `toLocaleString`
 * không truyền timeZone, `toISOString().slice(...)`) đều hiển thị lệch -7h so
 * với giờ Việt Nam. Ngược lại, form admin dùng `<input type="date">` /
 * `<input type="datetime-local">` gửi chuỗi KHÔNG kèm timezone — khi parse
 * phải neo tường minh vào +07:00, nếu không server sẽ hiểu thành UTC.
 *
 * Việt Nam dùng offset cố định +07:00 từ 1975 (không có DST) nên có thể dịch
 * mốc thời gian bằng hằng số — cùng cách tiếp cận với `src/lib/utils/ics.ts`
 * (FIX-11). Không phụ thuộc ICU/Intl → kết quả giống hệt nhau trên server,
 * edge runtime và browser (không gây hydration mismatch).
 */

export const VN_TIMEZONE = "Asia/Ho_Chi_Minh";
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Dịch một thời điểm sang "đồng hồ VN" — chỉ dùng nội bộ cho việc format. */
function shiftToVn(d: Date | string): Date {
  return new Date(new Date(d).getTime() + VN_OFFSET_MS);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** `true` nếu giá trị parse được thành thời điểm hợp lệ. */
function isValid(d: Date): boolean {
  return !Number.isNaN(d.getTime());
}

// ─── Format (hiển thị) ───────────────────────────────────────────────

/** "HH:mm" theo giờ VN. */
export function formatVnTime(d: Date | string): string {
  const v = shiftToVn(d);
  if (!isValid(v)) return "";
  return `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}`;
}

/** "dd/MM/yyyy" theo giờ VN. */
export function formatVnDate(d: Date | string): string {
  const v = shiftToVn(d);
  if (!isValid(v)) return "";
  return `${pad(v.getUTCDate())}/${pad(v.getUTCMonth() + 1)}/${v.getUTCFullYear()}`;
}

/** "HH:mm · dd/MM/yyyy" theo giờ VN — dòng thời gian sự kiện trên thiệp. */
export function formatVnDateTime(d: Date | string): string {
  const time = formatVnTime(d);
  if (!time) return "";
  return `${time} · ${formatVnDate(d)}`;
}

/** "dd tháng MM năm yyyy" theo giờ VN — ngày cưới trên hero thiệp. */
export function formatVnDateLong(d: Date | string): string {
  const v = shiftToVn(d);
  if (!isValid(v)) return "";
  return `${pad(v.getUTCDate())} tháng ${pad(v.getUTCMonth() + 1)} năm ${v.getUTCFullYear()}`;
}

// ─── Giá trị cho input form (admin) ──────────────────────────────────

/** "yyyy-MM-dd" theo giờ VN — defaultValue cho `<input type="date">`. */
export function toVnDateInputValue(d: Date | string): string {
  const v = shiftToVn(d);
  if (!isValid(v)) return "";
  return v.toISOString().slice(0, 10);
}

/** "yyyy-MM-ddTHH:mm" theo giờ VN — defaultValue cho `<input type="datetime-local">`. */
export function toVnDateTimeLocalValue(d: Date | string): string {
  const v = shiftToVn(d);
  if (!isValid(v)) return "";
  return v.toISOString().slice(0, 16);
}

// ─── Parse (server actions) ──────────────────────────────────────────

/**
 * Parse chuỗi từ `<input type="date">` ("yyyy-MM-dd") thành thời điểm
 * 00:00 giờ VN của ngày đó (countdown đếm tới nửa đêm VN, không phải nửa đêm UTC).
 */
export function parseVnDateInput(value: string): Date {
  return new Date(`${value}T00:00:00+07:00`);
}

/**
 * Parse chuỗi từ `<input type="datetime-local">` ("yyyy-MM-ddTHH:mm" hoặc
 * "yyyy-MM-ddTHH:mm:ss") thành thời điểm tương ứng theo giờ VN.
 */
export function parseVnDateTimeLocal(value: string): Date {
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  return new Date(`${withSeconds}+07:00`);
}
