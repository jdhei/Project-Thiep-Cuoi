import { z } from "zod";

export const UPLOAD_TYPES = ["cover", "gallery", "music", "gift"] as const;
export type UploadType = (typeof UPLOAD_TYPES)[number];

export const ALLOWED_MIME: Record<UploadType, string[]> = {
  cover: ["image/jpeg", "image/png", "image/webp"],
  gallery: ["image/jpeg", "image/png", "image/webp"],
  music: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"],
  gift: ["image/jpeg", "image/png", "image/webp"],
};

/**
 * Multipart upload hiện đi qua route handler, nên giữ payload dưới giới hạn
 * request của môi trường serverless. Có thể nâng lại khi chuyển sang direct upload.
 */
export const MAX_SIZE: Record<UploadType, number> = {
  cover: 3 * 1024 * 1024,
  gallery: 3 * 1024 * 1024,
  music: 4 * 1024 * 1024,
  gift: 3 * 1024 * 1024,
};

export const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/ogg": ".ogg",
};

export const uploadQuerySchema = z.object({
  weddingId: z.string().cuid("weddingId không hợp lệ"),
  type: z.enum(UPLOAD_TYPES, { errorMap: () => ({ message: "Loại upload không hợp lệ" }) }),
  caption: z.string().max(200).optional(),
});
