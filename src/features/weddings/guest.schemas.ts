import { z } from "zod";

/**
 * GUEST-01: Zod schema cho Guest (khách mời cá nhân).
 * GUEST-02: invitationCode sinh tự động phía server (không nhập tay).
 * GUEST-04: maximumPeople giới hạn số người khi RSVP.
 */
export const createGuestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Tên tối thiểu 2 ký tự")
    .max(100, "Tên tối đa 100 ký tự"),
  phone: z
    .string()
    .trim()
    .max(20, "Số điện thoại tối đa 20 ký tự")
    .optional()
    .or(z.literal("")),
  maximumPeople: z.coerce
    .number()
    .int("Phải là số nguyên")
    .min(1, "Tối thiểu 1 người")
    .max(20, "Tối đa 20 người")
    .default(1),
  personalizedMessage: z
    .string()
    .trim()
    .max(500, "Lời nhắn tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;

export const updateGuestSchema = createGuestSchema;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;

/**
 * GUEST-02: Sinh invitationCode ngẫu nhiên, dễ đọc (bỏ ký tự dễ nhầm 0/O/1/I/L).
 * 8 ký tự → không phân biệt hoa thường khi tra cứu (chuẩn hoá upper).
 *
 * FIX-07: dùng Web Crypto (CSPRNG) thay cho Math.random() — mã mời là thứ
 * duy nhất bảo vệ dữ liệu cá nhân hoá của khách (tên, lời nhắn riêng), nên
 * không được sinh bằng PRNG dự đoán được. Rejection sampling để tránh
 * modulo bias. `globalThis.crypto` có sẵn trên Node ≥18, Edge và browser.
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
// Ngưỡng loại bỏ bias: bội số lớn nhất của alphabet.length không vượt 256
const MAX_UNBIASED = 256 - (256 % CODE_ALPHABET.length);

export function generateInvitationCode(length = 8): string {
  let out = "";
  while (out.length < length) {
    const bytes = new Uint8Array(length * 2);
    globalThis.crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (out.length >= length) break;
      if (b < MAX_UNBIASED) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
    }
  }
  return out;
}
