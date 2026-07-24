/**
 * In-memory rate limiter (per key).
 *
 * - `checkRateLimit(ip)`: giới hạn đăng nhập (5 lần / 15 phút / IP).
 * - `checkWindowLimit(key, max, windowMs)`: giới hạn tuỳ biến cho các
 *   endpoint public (RSVP, wishes) theo key bất kỳ (vd. `rsvp:{id}:{ipHash}`).
 *
 * GIỚI HẠN ĐÃ BIẾT (chấp nhận cho MVP): state nằm trong bộ nhớ tiến trình —
 * trên môi trường serverless (Vercel) mỗi instance có Map riêng và reset khi
 * cold start, nên đây chỉ là hàng rào best-effort. Muốn chặt chẽ ở production
 * cần store dùng chung (Upstash Redis / Vercel KV). Xem docs/SECURITY-REVIEW.md.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** Chống Map phình vô hạn: dọn record hết hạn khi vượt ngưỡng. */
const CLEANUP_THRESHOLD = 10_000;

interface AttemptRecord {
  count: number;
  firstAttempt: number;
}

const attempts = new Map<string, AttemptRecord>();

// ─── Generic window limiter (public endpoints) ───────────────────────

const buckets = new Map<string, AttemptRecord & { windowMs: number }>();

function cleanupBuckets(now: number): void {
  if (buckets.size < CLEANUP_THRESHOLD) return;
  for (const [key, record] of buckets) {
    if (now - record.firstAttempt > record.windowMs) buckets.delete(key);
  }
}

/**
 * Giới hạn `max` lần trong cửa sổ `windowMs` cho một key bất kỳ.
 * @returns `true` nếu được phép, `false` nếu đã vượt giới hạn.
 */
export function checkWindowLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  cleanupBuckets(now);

  const record = buckets.get(key);
  if (!record || now - record.firstAttempt > windowMs) {
    buckets.set(key, { count: 1, firstAttempt: now, windowMs });
    return true;
  }
  if (record.count >= max) {
    return false;
  }
  record.count += 1;
  return true;
}

/**
 * Check if the IP is rate-limited. If not, increment the counter.
 * @returns `true` if the request is allowed, `false` if rate-limited.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  // No record or window expired → reset and allow
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }

  // Within window — check count
  if (record.count >= MAX_ATTEMPTS) {
    return false; // rate-limited
  }

  record.count += 1;
  return true;
}

/**
 * Reset attempts for an IP (call on successful login).
 */
export function resetAttempts(ip: string): void {
  attempts.delete(ip);
}

/**
 * Get remaining attempts for an IP (for testing).
 */
export function getRemainingAttempts(ip: string): number {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now - record.firstAttempt > WINDOW_MS) return MAX_ATTEMPTS;
  return Math.max(0, MAX_ATTEMPTS - record.count);
}
