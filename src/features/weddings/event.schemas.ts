import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(2, "Tối thiểu 2 ký tự").max(120, "Tối đa 120 ký tự"),
  startsAt: z.string().datetime({ message: "Thời gian không hợp lệ" }),
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
