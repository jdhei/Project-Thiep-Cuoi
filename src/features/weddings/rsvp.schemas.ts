import { z } from "zod";
import { attendanceStatusSchema } from "@/lib/domain";

/**
 * RSVP-01: Zod schema cho RSVP public submission.
 * - numberOfPeople: 0–20
 * - NOT_ATTENDING → numberOfPeople phải = 0
 */
export const rsvpSubmissionSchema = z
  .object({
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
    attendance: attendanceStatusSchema,
    numberOfPeople: z
      .number()
      .int("Phải là số nguyên")
      .min(0, "Không được âm")
      .max(20, "Tối đa 20 người"),
    message: z
      .string()
      .trim()
      .max(1000, "Lời nhắn tối đa 1000 ký tự")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.attendance === "NOT_ATTENDING" && data.numberOfPeople > 0) {
        return false;
      }
      return true;
    },
    {
      message: "Không tham dự thì số người phải bằng 0",
      path: ["numberOfPeople"],
    },
  );

export type RsvpSubmissionInput = z.infer<typeof rsvpSubmissionSchema>;

/**
 * RSVP-05: Zod schema cho Wish public submission.
 */
export const wishSubmissionSchema = z.object({
  guestName: z
    .string()
    .trim()
    .min(2, "Tên tối thiểu 2 ký tự")
    .max(100, "Tên tối đa 100 ký tự"),
  content: z
    .string()
    .trim()
    .min(1, "Lời chúc không được trống")
    .max(2000, "Lời chúc tối đa 2000 ký tự")
    // Strip control characters (except newline)
    .transform((s) => s.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")),
});

export type WishSubmissionInput = z.infer<typeof wishSubmissionSchema>;
