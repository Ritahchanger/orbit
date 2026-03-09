const { RedisClient } = require("../config/redis");

async function testRedisConnection() {
    console.log("🧪 Testing Redis connection...");

    try {
        // Test connection with PING
        const pingResult = await RedisClient.ping();
        console.log(`✅ Redis PING response: ${pingResult}`);

        // Test basic operations
        const testKey = "test:connection";
        const testValue = "Redis is working!";

        await RedisClient.set(testKey, testValue);
        const retrievedValue = await RedisClient.get(testKey);

        console.log(`✅ SET/GET test: ${retrievedValue === testValue ? "PASSED" : "FAILED"}`);

        // Test expiry
        await RedisClient.setEx("test:expiry", 5, "will expire");
        const ttl = await RedisClient.ttl("test:expiry");
        console.log(`✅ TTL test: ${ttl > 0 ? "PASSED" : "FAILED"} (TTL: ${ttl} seconds)`);

        // Clean up
        await RedisClient.del(testKey);
        await RedisClient.del("test:expiry");

        console.log("✅ All Redis tests passed!");
        return true;
    } catch (error) {
        console.error("❌ Redis test failed:", error.message);
        return false;
    }
}

// Test OTP functionality
async function testOTPOperations() {
    console.log("🧪 Testing OTP operations...");

    try {
        const email = "test@example.com";
        const otp = "123456";
        const purpose = "verification";

        // Test OTP storage
        await RedisClient.setOTP(email, otp, purpose, 60);
        const storedOTP = await RedisClient.getOTP(email, purpose);

        console.log(`✅ OTP storage test: ${storedOTP === otp ? "PASSED" : "FAILED"}`);

        // Test OTP deletion
        await RedisClient.deleteOTP(email, purpose);
        const deletedOTP = await RedisClient.getOTP(email, purpose);

        console.log(`✅ OTP deletion test: ${deletedOTP === null ? "PASSED" : "FAILED"}`);

        console.log("✅ OTP operations test passed!");
        return true;
    } catch (error) {
        console.error("❌ OTP test failed:", error.message);
        return false;
    }
}

module.exports = {
    testRedisConnection,
    testOTPOperations,
};