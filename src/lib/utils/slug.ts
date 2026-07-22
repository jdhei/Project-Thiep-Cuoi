import { z } from "zod";

/** Từ khoá dành riêng, không được dùng làm slug thiệp. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "logout",
  "preview",
  "w",
  "media",
  "static",
  "_next",
]);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Zod schema cho slug: chỉ chữ thường không dấu, số, gạch ngang;
 * không bắt đầu/kết thúc bằng gạch; không trùng từ khoá dành riêng.
 */
export const slugSchema = z
  .string()
  .trim()
  .min(3, "Slug tối thiểu 3 ký tự")
  .max(60, "Slug tối đa 60 ký tự")
  .regex(SLUG_RE, "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang")
  .refine((s) => !RESERVED_SLUGS.has(s), "Slug này thuộc danh sách dành riêng");

/** Chuyển chuỗi tiếng Việt có dấu thành slug hợp lệ. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
