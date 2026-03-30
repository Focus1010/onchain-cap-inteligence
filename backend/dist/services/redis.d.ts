export declare const CACHE_TTL = 300;
export declare function getCache<T>(key: string): Promise<T | null>;
export declare function setCache<T>(key: string, value: T, ttl?: number): Promise<void>;
export declare function generateCacheKey(endpoint: string, address: string): string;
//# sourceMappingURL=redis.d.ts.map