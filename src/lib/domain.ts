import { z } from "zod";

/**
 * Các "enum" nghiệp vụ. Vì SQLite không hỗ trợ enum ở tầng DB, ta lưu String
 * và ràng buộc kiểu tại tầng app bằng Zod. Đây là single source of truth.
 * Khi chuyển sang PostgreSQL có thể nâng cấp thành enum thật nếu muốn.
 */

export const WEDDING_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const ATTENDANCE_STATUS = ["ATTENDING", "NOT_ATTENDING", "MAYBE"] as const;
export const WISH_STATUS = ["PENDING", "APPROVED", "HIDDEN"] as const;

export const weddingStatusSchema = z.enum(WEDDING_STATUS);
export const attendanceStatusSchema = z.enum(ATTENDANCE_STATUS);
export const wishStatusSchema = z.enum(WISH_STATUS);

export type WeddingStatus = (typeof WEDDING_STATUS)[number];
export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[number];
export type WishStatus = (typeof WISH_STATUS)[number];

export const MEDIA_TYPE = ["cover", "gallery", "music", "gift"] as const;
export const mediaTypeSchema = z.enum(MEDIA_TYPE);
export type MediaType = (typeof MEDIA_TYPE)[number];
