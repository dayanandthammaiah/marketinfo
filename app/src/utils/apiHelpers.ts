/**
 * API Helper Utilities
 * Provides rate limiting, caching, and fallback mechanisms for API calls
 */

// Cache storage
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresIn: number;
}

class ApiCache {
    private cache = new Map<string, CacheEntry<any>>();

    set<T>(key: string, data: T, expiresInMs: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresIn: expiresInMs,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const age = Date.now() - entry.timestamp;
        if (age > entry.expiresIn) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    clear(): void {
        this.cache.clear();
    }
}

export const apiCache = new ApiCache();

// Rate limiting
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private limits = new Map<string, RateLimitEntry>();

    async checkLimit(key: string, maxCalls: number, windowMs: number): Promise<boolean> {
        const now = Date.now();
        const entry = this.limits.get(key);

        if (!entry || now > entry.resetTime) {
            this.limits.set(key, {
                count: 1,
                resetTime: now + windowMs,
            });
            return true;
        }

        if (entry.count < maxCalls) {
            entry.count++;
            return true;
        }

        return false;
    }

    async waitForSlot(key: string, maxCalls: number, windowMs: number): Promise<void> {
        while (!(await this.checkLimit(key, maxCalls, windowMs))) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

export const rateLimiter = new RateLimiter();

/**
 * Retry helper with exponential backoff and jitter
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    attempts: number = 3,
    baseDelayMs: number = 500,
    jitterMs: number = 200
): Promise<T> {
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (e) {
            lastError = e;
            const delay = baseDelayMs * Math.pow(2, i) + Math.floor(Math.random() * jitterMs);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    throw lastError;
}

// Data source interface
export interface DataSource<T> {
    name: string;
    fetch: () => Promise<T>;
    priority: number;
}

/**
 * Fetch data with automatic fallback to multiple sources
 */
export async function fetchWithFallback<T>(
    sources: DataSource<T>[],
    cacheKey?: string,
    cacheTimeMs?: number
): Promise<T> {
    // Check cache first
    if (cacheKey && cacheTimeMs) {
        const cached = apiCache.get<T>(cacheKey);
        if (cached) {
            console.log(`Cache hit for ${cacheKey}`);
            return cached;
        }
    }

    // Sort sources by priority
    const sortedSources = [...sources].sort((a, b) => a.priority - b.priority);

    // Try each source in order
    for (const source of sortedSources) {
        try {
            console.log(`Trying ${source.name}...`);
            const data = await source.fetch();

            if (data) {
                // Cache successful result
                if (cacheKey && cacheTimeMs) {
                    apiCache.set(cacheKey, data, cacheTimeMs);
                }
                console.log(`✓ ${source.name} succeeded`);
                return data;
            }
        } catch (error) {
            console.warn(`✗ ${source.name} failed:`, error instanceof Error ? error.message : error);
            continue;
        }
    }

    throw new Error('All data sources failed');
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 10000
): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeout);
        return response;
    } catch (error) {
        clearTimeout(timeout);
        throw error;
    }
}

/**
 * Parse RSS feed to JSON
 */
export async function parseRSSFeed(url: string): Promise<any[]> {
    try {
        const response = await fetchWithTimeout(url);
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const items = Array.from(xml.querySelectorAll('item'));
        return items.map(item => ({
            title: item.querySelector('title')?.textContent || '',
            link: item.querySelector('link')?.textContent || '',
            description: item.querySelector('description')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
            source: new URL(url).hostname,
        }));
    } catch (error) {
        console.error('RSS parse error:', error);
        return [];
    }
}

/**
 * Helper to safely parse JSON responses
 */
export async function safeJsonParse<T>(response: Response): Promise<T | null> {
    try {
        const text = await response.text();
        if (!text) return null;
        return JSON.parse(text) as T;
    } catch (error) {
        console.error('JSON parse error:', error);
        return null;
    }
}
