import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis | null = null;
let redisChecked = false;

function getRedisClient(): Redis | null {
  if (redisChecked) {
    return redisClient;
  }
  
  const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  redisChecked = true;
  
  // Only initialize if credentials are valid
  if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN && 
      UPSTASH_REDIS_REST_URL.startsWith('https://') && 
      !UPSTASH_REDIS_REST_URL.includes('your_upstash')) {
    try {
      redisClient = new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
      });
      console.log('✅ Redis client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      redisClient = null;
    }
  } else {
    console.log('⚠️  Redis credentials not found or invalid - caching disabled');
  }
  
  return redisClient;
}

// Cache TTL in seconds (5 minutes)
export const CACHE_TTL = 300;

export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error(`Redis get error for key ${key}:`, error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttl: number = CACHE_TTL): Promise<void> {
  const redis = getRedisClient();
  if (!redis) {
    return;
  }
  try {
    await redis.set(key, value, { ex: ttl });
  } catch (error) {
    console.error(`Redis set error for key ${key}:`, error);
  }
}

export function generateCacheKey(endpoint: string, address: string): string {
  return `${endpoint}:${address.toLowerCase()}`;
}
