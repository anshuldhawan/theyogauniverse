/**
 * TSF-9: contact-channel abuse controls — rate limiting per user/IP on
 * message submission. Upstash Redis in production; in-memory sliding window
 * in development.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 5; // contact submissions per hour per key

function redisRestUrl(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
}

function redisRestToken(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
}

const upstashConfigured = Boolean(redisRestUrl() && redisRestToken());

let contactLimiter: Ratelimit | null = null;
if (upstashConfigured) {
  contactLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(LIMIT, "1 h"),
    prefix: "the-yoga-universe:contact",
  });
}

const limiterCache = new Map<string, Ratelimit>();

function limiterFor(limit: number, windowSeconds: number): Ratelimit {
  const cacheKey = `${limit}:${windowSeconds}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `the-yoga-universe:rl:${limit}:${windowSeconds}`,
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

const memory = new Map<string, number[]>();

export async function checkContactRateLimit(key: string): Promise<{ allowed: boolean }> {
  if (contactLimiter) {
    const { success } = await contactLimiter.limit(key);
    return { allowed: success };
  }
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) {
    memory.set(key, hits);
    return { allowed: false };
  }
  hits.push(now);
  memory.set(key, hits);
  return { allowed: true };
}

/** Generic sliding-window limiter for other surfaces (public API, reports). */
export async function rateLimit(
  key: string,
  options: { limit: number; windowSeconds: number },
): Promise<{ ok: boolean; retryAfterSeconds?: number }> {
  if (upstashConfigured) {
    const { success, reset } = await limiterFor(options.limit, options.windowSeconds).limit(key);
    if (!success) {
      const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return { ok: false, retryAfterSeconds };
    }
    return { ok: true };
  }

  const windowMs = options.windowSeconds * 1000;
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= options.limit) {
    memory.set(key, hits);
    const oldest = Math.min(...hits);
    return { ok: false, retryAfterSeconds: Math.ceil((oldest + windowMs - now) / 1000) };
  }
  hits.push(now);
  memory.set(key, hits);
  return { ok: true };
}
