import { z } from "zod";
import { slugSchema } from "@/lib/utils/slug";

// ─── Create ──────────────────────────────────────────────────────────
export const createWeddingSchema = z.object({
  groomName: z.string().trim().min(2, "Tối thiểu 2 ký tự").max(60, "Tối đa 60 ký tự"),
  brideName: z.string().trim().min(2, "Tối thiểu 2 ký tự").max(60, "Tối đa 60 ký tự"),
  slug: slugSchema,
  weddingDate: z.string().datetime({ message: "Ngày không hợp lệ" }).optional().or(z.literal("")),
});

export type CreateWeddingInput = z.infer<typeof createWeddingSchema>;

// ─── Update content ──────────────────────────────────────────────────
export const updateWeddingSchema = z.object({
  groomName: z.string().trim().min(2, "Tối thiểu 2 ký tự").max(60, "Tối đa 60 ký tự"),
  brideName: z.string().trim().min(2, "Tối thiểu 2 ký tự").max(60, "Tối đa 60 ký tự"),
  slug: slugSchema,
  weddingDate: z.string().datetime({ message: "Ngày không hợp lệ" }).optional().or(z.literal("")),
  title: z.string().trim().max(200, "Tối đa 200 ký tự").optional().or(z.literal("")),
  introduction: z.string().trim().max(2000, "Tối đa 2000 ký tự").optional().or(z.literal("")),
  loveStory: z.string().trim().max(5000, "Tối đa 5000 ký tự").optional().or(z.literal("")),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu hex không hợp lệ")
    .optional()
    .or(z.literal("")),
  giftData: z.string().optional().or(z.literal("")),
  showCountdown: z.boolean().default(true),
  showStory: z.boolean().default(true),
  showGallery: z.boolean().default(true),
  showRsvp: z.boolean().default(true),
  showWishes: z.boolean().default(true),
  showGift: z.boolean().default(false),
  showMusic: z.boolean().default(true),
});

export type UpdateWeddingInput = z.infer<typeof updateWeddingSchema>;
