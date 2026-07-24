import { z } from "zod";

/**
 * Các "enum" nghiệp vụ. Lưu String ở DB và ràng buộc kiểu tại tầng app bằng
 * Zod — đây là single source of truth (ADR-001). Production dùng PostgreSQL
 * (ADR-006); PostgreSQL hỗ trợ enum thật nhưng ta chủ động giữ String để
 * đơn giản hoá migration và tương thích dữ liệu cũ. Nâng cấp thành enum
 * PostgreSQL là việc tách riêng nếu cần.
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
