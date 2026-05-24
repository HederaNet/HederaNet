import type { RequestHandler } from 'express';

// Simple in-memory rate limiter — replace with Upstash Redis in production
const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(maxPerMinute = 100): RequestHandler {
  return (req, res, next) => {
    const key = (req.ip ?? 'unknown') + req.path;
    const now = Date.now();
    const window = 60_000;

    let entry = requests.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + window };
    }

    entry.count++;
    requests.set(key, entry);

    res.setHeader('X-RateLimit-Limit', maxPerMinute);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxPerMinute - entry.count));

    if (entry.count > maxPerMinute) {
      res.status(429).json({ success: false, error: 'Too many requests' });
      return;
    }
    next();
  };
}
