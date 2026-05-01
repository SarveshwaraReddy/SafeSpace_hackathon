const Redis = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 2;
    this.warningLogged = false;
  }

  async connect() {
    if (this.isConnected) return this.client;

    // Don't even try if Redis is disabled in env
    if (process.env.REDIS_ENABLED === 'false') {
      if (!this.warningLogged) {
        console.log('📦 Redis disabled, using memory cache');
        this.warningLogged = true;
      }
      return null;
    }

    try {
      this.client = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retryStrategy: (times) => {
          if (times > this.maxRetries) {
            if (!this.warningLogged) {
              console.log('📦 Redis not available, using memory cache fallback');
              this.warningLogged = true;
            }
            return null; // Stop retrying
          }
          const delay = Math.min(times * 100, 1000);
          return delay;
        },
        disableOfflineQueue: true,
        // Suppress connection logs
        no_ready_check: true,
      });

      // Silent error handler - no console logs
      this.client.on('error', () => {
        // Silently ignore connection errors
      });

      this.client.on('connect', () => {
        if (!this.isConnected) {
          console.log('✅ Redis connected successfully');
          this.isConnected = true;
          this.warningLogged = false;
        }
      });

      // Attempt to connect with timeout
      const connectPromise = this.client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 2000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      return this.client;
      
    } catch (error) {
      if (!this.warningLogged) {
        console.log('📦 Redis not available, using memory cache fallback');
        this.warningLogged = true;
      }
      this.isConnected = false;
      return null;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  async disconnect() {
    if (this.isConnected && this.client) {
      try {
        await this.client.quit();
      } catch (error) {
        // Ignore
      }
      this.isConnected = false;
    }
  }
}

module.exports = new RedisClient();