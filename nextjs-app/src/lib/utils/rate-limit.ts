// ============================================================================
// RATE LIMIT UTILITIES (Client-side)
// ============================================================================

import { config } from '../config';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private cache: Map<string, RateLimitEntry> = new Map();
  private window: number;
  private maxRequests: number;

  constructor(window: number = config.rateLimit.window, maxRequests: number = config.rateLimit.maxRequests) {
    this.window = window;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry || now > entry.resetAt) {
      this.cache.set(key, {
        count: 1,
        resetAt: now + this.window,
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.resetAt) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get reset time
   */
  getResetTime(key: string): number {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.resetAt) {
      return Date.now() + this.window;
    }
    return entry.resetAt;
  }

  /**
   * Reset rate limit for key
   */
  reset(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.resetAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Cleanup expired entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 60000);
}
