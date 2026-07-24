import type { Wedding, WeddingEvent, WeddingMedia } from "@prisma/client";

export interface PublishValidation {
  valid: boolean;
  errors: string[];
  checks: { label: string; passed: boolean }[];
}

/**
 * Validate xem wedding có đủ điều kiện publish không.
 * Yêu cầu: weddingDate, ≥1 event, ≥1 WeddingMedia type=cover, không ARCHIVED.
 */
export function validatePublishReady(
  wedding: Wedding & { events: WeddingEvent[]; media: WeddingMedia[] },
): PublishValidation {
  const checks: { label: string; passed: boolean }[] = [];
  const errors: string[] = [];

  const notArchived = wedding.status !== "ARCHIVED";
  checks.push({ label: "Thiệp không ở trạng thái Archived", passed: notArchived });
  if (!notArchived) errors.push("Thiệp đang archived — hãy unarchive trước khi publish");

  const hasDate = !!wedding.weddingDate;
  checks.push({ label: "Đã có ngày cưới", passed: hasDate });
  if (!hasDate) errors.push("Chưa có ngày cưới");

  const hasEvents = wedding.events.length > 0;
  checks.push({ label: "Có ít nhất 1 sự kiện", passed: hasEvents });
  if (!hasEvents) errors.push("Cần ít nhất 1 sự kiện");

  const hasCover = wedding.media.some((item) => item.type === "cover");
  checks.push({ label: "Đã có ảnh bìa", passed: hasCover });
  if (!hasCover) errors.push("Cần ảnh bìa (cover)");

  return {
    valid: errors.length === 0,
    errors,
    checks,
  };
}
