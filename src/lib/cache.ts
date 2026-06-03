// Simple query cache to avoid redundant Firebase calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Singleton instance
export const queryCache = new QueryCache();

// Cached wrapper for async operations
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number,
): Promise<T> {
  // Check cache first
  const cached = queryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function
  const result = await fn();

  // Cache result
  queryCache.set(key, result, ttl);

  return result;
}

// Batch operations to reduce render count
export function batchUpdates(callback: () => void): void {
  if (typeof window !== "undefined" && "unstable_batchedUpdates" in window) {
    (window as any).unstable_batchedUpdates(callback);
  } else {
    callback();
  }
}
