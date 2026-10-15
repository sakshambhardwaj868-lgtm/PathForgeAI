import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

export function createSlidingRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests. Please wait before retrying.',
    keyGenerator = (req: Request) => req.ip || req.socket.remoteAddress || 'unknown-client',
  } = options;

  const hits = new Map<string, RateLimitRecord>();

  // Periodically clean up stale entries (every 5 minutes)
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        hits.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Unref interval so it doesn't hold process open during tests
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();
    let record = hits.get(key);

    if (!record) {
      record = { timestamps: [] };
      hits.set(key, record);
    }

    // Filter out timestamps outside window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds,
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}

// 15 share link creations per 60s per user/IP
export const createShareLimiter = createSlidingRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: 'Share link creation rate limit exceeded. Please wait a minute before creating more links.',
  keyGenerator: (req: any) => req.user?.userId || req.ip || 'anonymous',
});

// 60 public lookups per 60s per IP
export const publicShareLimiter = createSlidingRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Public roadmap view rate limit exceeded. Please try again shortly.',
});

// 30 auth requests per 15m per IP (prevents brute-force credential stuffing)
export const authLimiter = createSlidingRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
});
