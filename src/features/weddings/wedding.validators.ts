import type { Wedding, WeddingEvent, WeddingMedia } from "@prisma/client";

export interface PublishValidation {
  valid: boolean;
  errors: string[];
  checks: { label: string; passed: boolean }[];
}

/**
 * Validate xem wedding có đủ điều kiện publish không.
 * Yêu cầu: weddingDate, ≥1 event, có ảnh bìa, không ARCHIVED.
 *
 * Ảnh bìa được upload qua /api/uploads và lưu thành bản ghi WeddingMedia
 * (type="cover") — đây là nguồn sự thật. `Wedding.coverPath` chỉ là trường
 * legacy (seed/dữ liệu cũ) và được chấp nhận để tương thích ngược.
 */
export function validatePublishReady(
  wedding: Wedding & {
    events: WeddingEvent[];
    media: Pick<WeddingMedia, "type">[];
  },
): PublishValidation {
  const checks: { label: string; passed: boolean }[] = [];
  const errors: string[] = [];

  // 1. Không cho publish từ ARCHIVED
  const notArchived = wedding.status !== "ARCHIVED";
  checks.push({ label: "Thiệp không ở trạng thái Archived", passed: notArchived });
  if (!notArchived) errors.push("Thiệp đang archived — hãy unarchive trước khi publish");

  // 2. Ngày cưới
  const hasDate = !!wedding.weddingDate;
  checks.push({ label: "Đã có ngày cưới", passed: hasDate });
  if (!hasDate) errors.push("Chưa có ngày cưới");

  // 3. Ít nhất 1 sự kiện
  const hasEvents = wedding.events.length > 0;
  checks.push({ label: "Có ít nhất 1 sự kiện", passed: hasEvents });
  if (!hasEvents) errors.push("Cần ít nhất 1 sự kiện");

  // 4. Ảnh bìa — ưu tiên WeddingMedia (luồng upload chuẩn), fallback coverPath (legacy)
  const hasCover =
    wedding.media.some((m) => m.type === "cover") || !!wedding.coverPath;
  checks.push({ label: "Đã có ảnh bìa", passed: hasCover });
  if (!hasCover) errors.push("Cần ảnh bìa (cover)");

  return {
    valid: errors.length === 0,
    errors,
    checks,
  };
}
