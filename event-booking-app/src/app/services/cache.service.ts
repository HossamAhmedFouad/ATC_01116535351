import { Injectable } from '@angular/core';

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number; // time-to-live in milliseconds
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();

  // Default time-to-live is 5 minutes (300,000 ms)
  private defaultTtl = 300000;

  constructor() {}
  /**
   * Set a value in the cache
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Time-to-live in milliseconds (optional, defaults to 5 minutes)
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTtl): void {
    console.log(`Cache SET: ${key}, TTL: ${ttl}ms`);
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }
  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    // If item doesn't exist or has expired, return null
    if (!item || Date.now() - item.timestamp > item.ttl) {
      if (item) {
        console.log(`Cache EXPIRED: ${key}`);
        this.cache.delete(key); // Clean up expired item
      } else {
        console.log(`Cache MISS: ${key}`);
      }
      return null;
    }

    console.log(`Cache HIT: ${key}`);
    return item.value as T;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key The cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const expired = Date.now() - item.timestamp > item.ttl;
    if (expired) {
      this.cache.delete(key); // Clean up expired item
      return false;
    }

    return true;
  }

  /**
   * Remove a key from the cache
   * @param key The cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  /**
   * Clear all items with keys that start with the given prefix
   * @param keyPrefix The prefix to match
   */
  clearWithPrefix(keyPrefix: string): void {
    let count = 0;
    this.cache.forEach((_, key) => {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
        count++;
      }
    });
    console.log(
      `Cache CLEAR with prefix '${keyPrefix}': ${count} items removed`
    );
  }

  /**
   * Get cache statistics for debugging
   * @returns Object with statistics about the cache
   */
  getStats(): any {
    const stats = {
      totalEntries: this.cache.size,
      entries: [] as any[],
    };

    this.cache.forEach((item, key) => {
      stats.entries.push({
        key,
        timestamp: new Date(item.timestamp),
        expires: new Date(item.timestamp + item.ttl),
        ttl: item.ttl,
        isExpired: Date.now() - item.timestamp > item.ttl,
      });
    });

    return stats;
  }

  /**
   * Get all cache keys
   * @returns Array of all cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}
