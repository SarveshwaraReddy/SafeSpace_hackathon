const Redis = require('ioredis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionPromise = null;
    this.warningLogged = false;
  }

  async connect() {
    if (this.isConnected && this.client) {
      return this.client;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (process.env.REDIS_ENABLED === 'false') {
      if (!this.warningLogged) {
        console.log('📦 Redis disabled, using memory cache');
        this.warningLogged = true;
      }
      this.isConnected = false;
      return null;
    }

    this.connectionPromise = this._connect();
    
    try {
      const result = await this.connectionPromise;
      return result;
    } finally {
      this.connectionPromise = null;
    }
  }

  async _connect() {
    try {
      // Check if using Redis URL (for online Redis services)
      let redisConfig;
      
      if (process.env.REDIS_URL) {
        // console.log(`🔄 Connecting to online Redis at ${process.env.REDIS_URL.replace(/\/\/.*@/, '//***:***@')}...`);
        redisConfig = process.env.REDIS_URL;
      } else {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = parseInt(process.env.REDIS_PORT) || 6379;
        // console.log(`🔄 Connecting to Redis at ${host}:${port}...`);
        redisConfig = {
          host: host,
          port: port,
          password: process.env.REDIS_PASSWORD || undefined,
          family: 4,
        };
      }

      this.client = new Redis(redisConfig, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 100, 3000);
          console.log(`Redis retry attempt ${times}, waiting ${delay}ms...`);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        keepAlive: 30000,
      });

      // Event handlers
      this.client.on('error', (err) => {
        console.error('Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
        this.warningLogged = false;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis is ready');
        this.isConnected = true;
      });

      this.client.on('close', () => {
        if (this.isConnected) {
          console.log('⚠️ Redis connection closed');
        }
        this.isConnected = false;
      });

      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.client.once('ready', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.client.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      // Test connection
      const pong = await this.client.ping();
      console.log(`✅ Redis ping response: ${pong}`);
      
      return this.client;
      
    } catch (error) {
      console.log('📦 Redis not available, using memory cache fallback');
      console.log(`   Reason: ${error.message}`);
      this.isConnected = false;
      return null;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error('Redis get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.isConnected || !this.client) {
      console.log(`Redis not connected, using memory cache for key: ${key.substring(0, 30)}...`);
      return false;
    }
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.setex(key, ttl, stringValue);
      console.log(`✅ Redis SET successful: ${key.substring(0, 30)}...`);
      return true;
    } catch (error) {
      console.error('Redis set error:', error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis del error:', error.message);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected || !this.client) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      return false;
    }
  }

  async ping() {
    if (!this.isConnected || !this.client) return false;
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (error) {
        // Ignore
      }
      this.isConnected = false;
      this.client = null;
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      redisEnabled: process.env.REDIS_ENABLED !== 'false',
      hasClient: !!this.client,
      usingUrl: !!process.env.REDIS_URL
    };
  }
}

module.exports = new RedisClient();