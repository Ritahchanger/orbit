const Redis = require("ioredis");
require("dotenv").config();

class RedisClient {
    constructor() {
        this.client = null;
        this.connect();
    }

    connect() {
        try {
            const redisConfig = {
                host: process.env.REDIS_HOST || "localhost",
                port: parseInt(process.env.REDIS_PORT) || 6379,
                password: process.env.REDIS_PASSWORD || null,
                db: parseInt(process.env.REDIS_DB) || 0,
                retryStrategy: function (times) {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                connectTimeout: 10000, // 10 seconds
            };

            // Add TLS/SSL configuration if needed (for Redis Cloud/Heroku Redis)
            if (process.env.REDIS_TLS === "true") {
                redisConfig.tls = {};
            }

            this.client = new Redis(redisConfig);

            // Event listeners
            this.client.on("connect", () => {
                console.log("🟢 Redis: Connecting to Redis server...");
            });

            this.client.on("ready", () => {
                console.log("✅ Redis: Successfully connected to Redis server");
            });

            this.client.on("error", (error) => {
                console.error("❌ Redis Error:", error.message);
            });

            this.client.on("close", () => {
                console.log("🔴 Redis: Connection closed");
            });

            this.client.on("reconnecting", () => {
                console.log("🔄 Redis: Reconnecting...");
            });

        } catch (error) {
            console.error("❌ Failed to connect to Redis:", error);
            throw error;
        }
    }

    // Basic Redis operations
    async set(key, value, expiryMode = null, time = null) {
        try {
            if (expiryMode && time) {
                return await this.client.set(key, value, expiryMode, time);
            }
            return await this.client.set(key, value);
        } catch (error) {
            console.error(`Redis SET error for key ${key}:`, error);
            throw error;
        }
    }

    async get(key) {
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error(`Redis GET error for key ${key}:`, error);
            throw error;
        }
    }

    async del(key) {
        try {
            return await this.client.del(key);
        } catch (error) {
            console.error(`Redis DEL error for key ${key}:`, error);
            throw error;
        }
    }

    async setEx(key, seconds, value) {
        try {
            return await this.client.setex(key, seconds, value);
        } catch (error) {
            console.error(`Redis SETEX error for key ${key}:`, error);
            throw error;
        }
    }

    async expire(key, seconds) {
        try {
            return await this.client.expire(key, seconds);
        } catch (error) {
            console.error(`Redis EXPIRE error for key ${key}:`, error);
            throw error;
        }
    }

    async ttl(key) {
        try {
            return await this.client.ttl(key);
        } catch (error) {
            console.error(`Redis TTL error for key ${key}:`, error);
            throw error;
        }
    }

    async incr(key) {
        try {
            return await this.client.incr(key);
        } catch (error) {
            console.error(`Redis INCR error for key ${key}:`, error);
            throw error;
        }
    }

    async decr(key) {
        try {
            return await this.client.decr(key);
        } catch (error) {
            console.error(`Redis DECR error for key ${key}:`, error);
            throw error;
        }
    }

    async exists(key) {
        try {
            return await this.client.exists(key);
        } catch (error) {
            console.error(`Redis EXISTS error for key ${key}:`, error);
            throw error;
        }
    }

    async keys(pattern) {
        try {
            return await this.client.keys(pattern);
        } catch (error) {
            console.error(`Redis KEYS error for pattern ${pattern}:`, error);
            throw error;
        }
    }

    async flushAll() {
        try {
            return await this.client.flushall();
        } catch (error) {
            console.error("Redis FLUSHALL error:", error);
            throw error;
        }
    }

    async quit() {
        try {
            await this.client.quit();
            console.log("🛑 Redis: Connection closed gracefully");
        } catch (error) {
            console.error("Redis QUIT error:", error);
            throw error;
        }
    }

    // OTP-specific methods (for convenience)
    async setOTP(email, otp, purpose = "verification", expiry = 600) {
        const key = `otp:${purpose}:${email}`;
        return await this.setEx(key, expiry, otp);
    }

    async getOTP(email, purpose = "verification") {
        const key = `otp:${purpose}:${email}`;
        return await this.get(key);
    }

    async deleteOTP(email, purpose = "verification") {
        const key = `otp:${purpose}:${email}`;
        return await this.del(key);
    }

    async setWithNX(key, value, expiry = null) {
        try {
            if (expiry) {
                return await this.client.set(key, value, "EX", expiry, "NX");
            }
            return await this.client.set(key, value, "NX");
        } catch (error) {
            console.error(`Redis SET NX error for key ${key}:`, error);
            throw error;
        }
    }

    // Hash operations
    async hset(key, field, value) {
        try {
            return await this.client.hset(key, field, value);
        } catch (error) {
            console.error(`Redis HSET error for key ${key}:`, error);
            throw error;
        }
    }

    async hget(key, field) {
        try {
            return await this.client.hget(key, field);
        } catch (error) {
            console.error(`Redis HGET error for key ${key}:`, error);
            throw error;
        }
    }

    async hgetall(key) {
        try {
            return await this.client.hgetall(key);
        } catch (error) {
            console.error(`Redis HGETALL error for key ${key}:`, error);
            throw error;
        }
    }

    async hdel(key, field) {
        try {
            return await this.client.hdel(key, field);
        } catch (error) {
            console.error(`Redis HDEL error for key ${key}:`, error);
            throw error;
        }
    }

    // List operations
    async lpush(key, value) {
        try {
            return await this.client.lpush(key, value);
        } catch (error) {
            console.error(`Redis LPUSH error for key ${key}:`, error);
            throw error;
        }
    }

    async rpush(key, value) {
        try {
            return await this.client.rpush(key, value);
        } catch (error) {
            console.error(`Redis RPUSH error for key ${key}:`, error);
            throw error;
        }
    }

    async lrange(key, start, stop) {
        try {
            return await this.client.lrange(key, start, stop);
        } catch (error) {
            console.error(`Redis LRANGE error for key ${key}:`, error);
            throw error;
        }
    }

    // Set operations
    async sadd(key, member) {
        try {
            return await this.client.sadd(key, member);
        } catch (error) {
            console.error(`Redis SADD error for key ${key}:`, error);
            throw error;
        }
    }

    async smembers(key) {
        try {
            return await this.client.smembers(key);
        } catch (error) {
            console.error(`Redis SMEMBERS error for key ${key}:`, error);
            throw error;
        }
    }

    async sismember(key, member) {
        try {
            return await this.client.sismember(key, member);
        } catch (error) {
            console.error(`Redis SISMEMBER error for key ${key}:`, error);
            throw error;
        }
    }

    // Pipeline for multiple operations
    async pipeline(operations) {
        try {
            const pipeline = this.client.pipeline();
            operations.forEach(([command, ...args]) => {
                pipeline[command](...args);
            });
            return await pipeline.exec();
        } catch (error) {
            console.error("Redis PIPELINE error:", error);
            throw error;
        }
    }

    // Health check
    async ping() {
        try {
            return await this.client.ping();
        } catch (error) {
            console.error("Redis PING error:", error);
            return "Redis connection failed";
        }
    }

    // Get Redis info
    async info() {
        try {
            return await this.client.info();
        } catch (error) {
            console.error("Redis INFO error:", error);
            throw error;
        }
    }
}

// Create a singleton instance
const redisClient = new RedisClient();

// Export both the class and the instance
module.exports = {
    RedisClient: redisClient,
    redis: redisClient.client, // Direct redis instance if needed
};