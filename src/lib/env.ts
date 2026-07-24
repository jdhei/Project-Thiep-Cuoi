import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

/**
 * Validate biến môi trường ở server. Không bao giờ import file này vào client component.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(1, "ADMIN_PASSWORD_HASH bắt buộc"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET phải >= 32 ký tự"),

  // Supabase Storage — bắt buộc cho upload ở production.
  SUPABASE_URL: optionalUrl,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("wedding-media"),

  // Chỉ dùng làm fallback khi chạy local với dữ liệu upload cũ.
  UPLOAD_ROOT: z.string().min(1).default("./storage/uploads"),

  IP_HASH_SECRET: z.string().min(16, "IP_HASH_SECRET phải >= 16 ký tự"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Cloudflare Zero Trust. Production fail-closed nếu thiếu một trong hai biến.
  CF_ACCESS_TEAM_NAME: optionalString,
  CF_ACCESS_AUD: optionalString,
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Biến môi trường không hợp lệ:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
