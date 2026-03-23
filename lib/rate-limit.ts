/**
 * Simple in-memory rate limiter for API routes.
 * In production with multiple instances, replace with Redis-based solution.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 60_000)

interface RateLimitOptions {
  /** Maximum number of requests in the window */
  maxRequests: number
  /** Window duration in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    const resetAt = now + options.windowSeconds * 1000
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: options.maxRequests - 1, resetAt }
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  }
}
