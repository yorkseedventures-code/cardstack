// Simple in-memory rate limiter
// Limits requests per IP to prevent brute force and abuse

const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  ip: string,
  limit: number = 20,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requests.entries()) {
    if (now > value.resetAt) requests.delete(key);
  }
}, 300_000);
