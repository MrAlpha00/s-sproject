export interface RateLimiterOptions {
  maxRequests: number; // max tokens in bucket
  windowMs: number;    // timeframe to refill bucket completely
}

export class RateLimiter {
  private static buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();

  static isRateLimited(key: string, options: RateLimiterOptions): { limited: boolean; retryAfterMs: number } {
    const now = Date.now();
    const bucket = this.buckets.get(key) || { tokens: options.maxRequests, lastRefill: now };

    // 1. Calculate token refills since last refill check
    const elapsed = now - bucket.lastRefill;
    const refillRate = options.maxRequests / options.windowMs;
    const refilledTokens = elapsed * refillRate;
    
    const newTokens = Math.min(options.maxRequests, bucket.tokens + refilledTokens);
    
    // 2. If bucket has no tokens, rate limit
    if (newTokens < 1) {
      const waitTime = Math.max(0, Math.ceil((1 - newTokens) / refillRate));
      return {
        limited: true,
        retryAfterMs: waitTime,
      };
    }

    // 3. Deduct token and save bucket state
    this.buckets.set(key, {
      tokens: newTokens - 1,
      lastRefill: now,
    });

    return {
      limited: false,
      retryAfterMs: 0,
    };
  }

  static clear(key: string) {
    this.buckets.delete(key);
  }
}
