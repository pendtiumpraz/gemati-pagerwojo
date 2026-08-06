/**
 * Rate limiter sederhana in-memory (per key) untuk endpoint login.
 * Catatan: pada serverless multi-instance ini per-instance; untuk produksi
 * gunakan store terpusat (Redis/Upstash). Cukup untuk mitigasi brute-force dasar.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  max = 5,
  windowMs = 15 * 60 * 1000
): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfter: 0 };
  }
  if (b.count >= max) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, remaining: max - b.count, retryAfter: 0 };
}

/** Reset bucket setelah login sukses */
export function rateLimitReset(key: string) {
  buckets.delete(key);
}
