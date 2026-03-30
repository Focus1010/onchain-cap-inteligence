"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = void 0;
exports.getCache = getCache;
exports.setCache = setCache;
exports.generateCacheKey = generateCacheKey;
const redis_1 = require("@upstash/redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let redisClient = null;
let redisChecked = false;
function getRedisClient() {
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
            redisClient = new redis_1.Redis({
                url: UPSTASH_REDIS_REST_URL,
                token: UPSTASH_REDIS_REST_TOKEN,
            });
            console.log('✅ Redis client initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize Redis:', error);
            redisClient = null;
        }
    }
    else {
        console.log('⚠️  Redis credentials not found or invalid - caching disabled');
    }
    return redisClient;
}
// Cache TTL in seconds (5 minutes)
exports.CACHE_TTL = 300;
async function getCache(key) {
    const redis = getRedisClient();
    if (!redis) {
        return null;
    }
    try {
        const data = await redis.get(key);
        return data;
    }
    catch (error) {
        console.error(`Redis get error for key ${key}:`, error);
        return null;
    }
}
async function setCache(key, value, ttl = exports.CACHE_TTL) {
    const redis = getRedisClient();
    if (!redis) {
        return;
    }
    try {
        await redis.set(key, value, { ex: ttl });
    }
    catch (error) {
        console.error(`Redis set error for key ${key}:`, error);
    }
}
function generateCacheKey(endpoint, address) {
    return `${endpoint}:${address.toLowerCase()}`;
}
//# sourceMappingURL=redis.js.map