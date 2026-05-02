const redisClient = require('../config/redis');

// In-memory cache fallback when Redis is not available
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 3600; // 1 hour
  }

  async get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
    return true;
  }

  async del(key) {
    return this.cache.delete(key);
  }

  async invalidatePattern(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

class CacheService {
  constructor() {
    this.memoryCache = new MemoryCache();
    this.useRedis = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = (async () => {
      try {
        // await redisClient.connect();
        this.useRedis = redisClient.isConnected;
        if (this.useRedis) {
          console.log('✅ Using Redis cache');
        } else {
          console.log('📦 Using in-memory cache fallback');
        }
      } catch (error) {
        console.log('📦 Using in-memory cache fallback');
        this.useRedis = false;
      }
    })();
    
    return this.initPromise;
  }

  async get(key) {
    await this.init();
    
    if (this.useRedis) {
      return await redisClient.get(key);
    } else {
      return await this.memoryCache.get(key);
    }
  }

  async set(key, value, ttl = 3600) {
    await this.init();
    
    if (this.useRedis) {
      return await redisClient.set(key, value, ttl);
    } else {
      return await this.memoryCache.set(key, value, ttl);
    }
  }

  async del(key) {
    await this.init();
    
    if (this.useRedis) {
      return await redisClient.del(key);
    } else {
      return await this.memoryCache.del(key);
    }
  }

  async invalidatePattern(pattern) {
    await this.init();
    
    if (this.useRedis) {
      // For Redis, we need to scan for keys
      try {
        const keys = await redisClient.client.keys(pattern);
        if (keys && keys.length > 0) {
          await Promise.all(keys.map(key => redisClient.del(key)));
        }
      } catch (error) {
        console.error('Redis pattern invalidation error:', error);
      }
    } else {
      await this.memoryCache.invalidatePattern(pattern);
    }
  }

  // Rate limiting with fallback
  async rateLimit(key, limit, window) {
    await this.init();
    
    if (this.useRedis) {
      const current = await redisClient.get(key);
      const count = current ? parseInt(current) : 0;
      
      if (count >= limit) return false;
      
      if (count === 0) {
        await redisClient.set(key, 1, window);
      } else {
        await redisClient.client.incr(key);
      }
      return true;
    } else {
      // Simple in-memory rate limiting
      const memoryKey = `ratelimit:${key}`;
      const current = await this.memoryCache.get(memoryKey);
      const count = current ? parseInt(current) : 0;
      
      if (count >= limit) return false;
      
      if (count === 0) {
        await this.memoryCache.set(memoryKey, 1, window);
      } else {
        const newCount = count + 1;
        await this.memoryCache.set(memoryKey, newCount, window);
      }
      return true;
    }
  }
}

module.exports = new CacheService();