import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on('error', (err) => {
      console.warn('Redis error, caching will be disabled:', err.message);
      redisClient = null; // Disable cache on error
    });
    console.log('Redis client initialized');
  } else {
    console.log('REDIS_URL not found, caching disabled');
  }
} catch (error) {
  console.warn('Could not initialize Redis, continuing without cache');
}

export const getCache = async (key: string): Promise<string | null> => {
  if (!redisClient) return null;
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.warn(`Cache get error for ${key}:`, error);
    return null;
  }
};

export const setCache = async (key: string, value: string, ttlSeconds: number = 3600): Promise<void> => {
  if (!redisClient) return;
  try {
    await redisClient.setex(key, ttlSeconds, value);
  } catch (error) {
    console.warn(`Cache set error for ${key}:`, error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
    if (!redisClient) return;
    try {
        await redisClient.del(key);
    } catch (error) {
        console.warn(`Cache delete error for ${key}:`, error);
    }
}
