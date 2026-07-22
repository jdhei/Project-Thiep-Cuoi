/**
 * In-memory rate limiter for login attempts (per IP).
 * Limits: MAX_ATTEMPTS within WINDOW_MS. After that → 429.
 * Resets on successful login via `resetAttempts(ip)`.
 *
 * For MVP — no Redis needed. State resets on server restart (acceptable).
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  firstAttempt: number;
}

const attempts = new Map<string, AttemptRecord>();

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
