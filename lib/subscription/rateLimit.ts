/**
 * In-memory rate limit (Sprint 1).
 * Serverless isolate'ler ayrı map tutar — yaklaşık koruma; Sprint 4'te sıkılaştırılabilir.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT_IP = 20;
const LIMIT_EMAIL = 5;

function hit(key: string, limit: number): boolean {
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || now >= cur.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  cur.count += 1;
  return cur.count > limit;
}

export function isSubscribeRateLimited(opts: {
  ip: string;
  email: string;
}): boolean {
  const ipLimited = hit(`ip:${opts.ip || "unknown"}`, LIMIT_IP);
  const emailLimited = hit(`email:${opts.email}`, LIMIT_EMAIL);
  return ipLimited || emailLimited;
}
