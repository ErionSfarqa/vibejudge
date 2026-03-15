type RateLimitConfig = {
  key: string;
  windowMs?: number;
  maxRequests?: number;
};

type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

const memoryStore = new Map<string, RateLimitEntry>();

export function checkRateLimit({
  key,
  windowMs = 60_000,
  maxRequests = 8
}: RateLimitConfig) {
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || existing.expiresAt <= now) {
    memoryStore.set(key, {
      count: 1,
      expiresAt: now + windowMs
    });

    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs
    };
  }

  if (existing.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.expiresAt
    };
  }

  existing.count += 1;
  memoryStore.set(key, existing);

  return {
    success: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.expiresAt
  };
}

// Replace this in production with a shared store such as Redis or Upstash.

