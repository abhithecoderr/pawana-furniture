/**
 * Redis Client Configuration
 *
 * Uses Aiven Valkey (Redis-compatible) for caching.
 * Connection URL should be set in REDIS_URL environment variable.
 */

import Redis from 'ioredis';

let redis = null;

// Initialize Redis connection
function initRedis() {
  if (!process.env.REDIS_URL) {
    console.log('⚠️  REDIS_URL not set - caching disabled');
    return null;
  }

  try {
    redis = new Redis(process.env.REDIS_URL, {
      // Aiven requires TLS
      tls: {
        rejectUnauthorized: false // Aiven uses self-signed certs
      },
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true, // Don't connect until first command
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    return redis;
  } catch (error) {
    console.error('❌ Redis init failed:', error.message);
    return null;
  }
}

// Get cached data or fetch from source
async function getOrSet(key, fetchFn, ttlSeconds = 300) {
  // If Redis not available, just fetch directly
  if (!redis) {
    return await fetchFn();
  }

  try {
    // Try to get from cache
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Not in cache - fetch from source
    const data = await fetchFn();

    // Store in cache (don't await - fire and forget)
    redis.setex(key, ttlSeconds, JSON.stringify(data)).catch(() => {});

    return data;
  } catch (error) {
    // On any Redis error, fall back to direct fetch
    console.error('Cache error:', error.message);
    return await fetchFn();
  }
}

// Invalidate cache keys by pattern
async function invalidate(pattern) {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️  Invalidated ${keys.length} cache keys: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error.message);
  }
}

// Invalidate specific key
async function del(key) {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error.message);
  }
}

// Get Redis client (for direct access if needed)
function getClient() {
  return redis;
}

export { initRedis, getOrSet, invalidate, del, getClient };
