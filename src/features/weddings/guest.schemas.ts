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
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateInvitationCode(length = 8): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}
