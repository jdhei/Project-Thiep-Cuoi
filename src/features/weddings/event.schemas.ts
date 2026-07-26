import { z } from "zod";

/**
 * FIX-16: form admin dùng <input type="datetime-local"> nên gửi
 * "yyyy-MM-ddTHH:mm" (không giây, không timezone) — z.string().datetime()
 * (đòi ISO đầy đủ + Z) khiến mọi lần tạo/sửa sự kiện đều fail.
 * Chuỗi này được server parse với offset +07:00 tường minh
 * (parseVnDateTimeLocal trong event.actions.ts).
 */
const DATETIME_LOCAL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

export const createEventSchema = z.object({
  title: z.string().trim().min(2, "Tối thiểu 2 ký tự").max(120, "Tối đa 120 ký tự"),
  startsAt: z
    .string()
    .regex(DATETIME_LOCAL_RE, "Thời gian không hợp lệ")
    .refine((s) => !Number.isNaN(new Date(`${s.length === 16 ? `${s}:00` : s}+07:00`).getTime()), {
      message: "Thời gian không hợp lệ",
    }),
  address: z.string().trim().min(2, "Tối thiểu 2 ký tự").max(300, "Tối đa 300 ký tự"),
  mapUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  description: z.string().trim().max(500, "Tối đa 500 ký tự").optional().or(z.literal("")),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.extend({
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const reorderEventsSchema = z.object({
  eventIds: z.array(z.string().cuid()).min(1),
});
