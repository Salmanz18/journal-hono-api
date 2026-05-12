import type { MiddlewareHandler } from 'hono';

import { RATE_LIMIT } from '@config/constants';
import { RateLimitError } from '@lib/errors';

import type { AppContext } from '@/types/context';

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  keyGenerator?: (c: Parameters<MiddlewareHandler<AppContext>>[0]) => string;
}

// In-memory bucket. Swap for Redis (or similar) when running multiple
// instances — a single-process Map will not coordinate across workers.
const buckets = new Map<string, Bucket>();

export const rateLimit = (options: RateLimitOptions = {}): MiddlewareHandler<AppContext> => {
  const windowMs = options.windowMs ?? RATE_LIMIT.WINDOW_MS;
  const max = options.max ?? RATE_LIMIT.MAX_REQUESTS;
  const keyGen =
    options.keyGenerator ??
    ((c) =>
      c.req.header('x-forwarded-for') ??
      c.req.header('cf-connecting-ip') ??
      c.req.raw.headers.get('host') ??
      'anonymous');

  return async (c, next) => {
    const key = keyGen(c);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      bucket.count += 1;
      if (bucket.count > max) {
        const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
        c.header('Retry-After', String(retryAfter));
        throw new RateLimitError('Too many requests', { retryAfter });
      }
    }

    await next();
  };
};
