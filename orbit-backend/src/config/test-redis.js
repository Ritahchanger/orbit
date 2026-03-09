const { RedisClient } = require("./redis");

async function testRedisConnection() {
    console.log("🧪 Testing Redis Configuration...");

    try {
        // Test 1: Basic ping
        console.log("1. Testing connection...");
        const pingResult = await RedisClient.ping();
        console.log(`✅ Ping result: ${pingResult}`);

        // Test 2: Basic set/get
        console.log("2. Testing set/get operations...");
        await RedisClient.set("test:key", "Hello Redis!");
        const value = await RedisClient.get("test:key");
        console.log(`✅ Get result: ${value}`);

        // Test 3: Set with expiry
        console.log("3. Testing expiry...");
        await RedisClient.setEx("test:expiry", 5, "Expires in 5 seconds");
        const ttl = await RedisClient.ttl("test:expiry");
        console.log(`✅ TTL: ${ttl} seconds`);

        // Test 4: OTP-specific method
        console.log("4. Testing OTP methods...");
        const testEmail = "test@example.com";
        const testOTP = "123456";

        await RedisClient.setOTP(testEmail, testOTP, "verification", 60);
        const storedOTP = await RedisClient.getOTP(testEmail, "verification");
        console.log(`✅ OTP stored and retrieved: ${storedOTP}`);

        // Test 5: Cleanup
        console.log("5. Cleaning up test data...");
        await RedisClient.del("test:key");
        await RedisClient.del("test:expiry");
        await RedisClient.deleteOTP(testEmail, "verification");

        console.log("\n🎉 All Redis tests passed! Your configuration is working correctly.");
        console.log("Redis is ready for OTP authentication system.");

    } catch (error) {
        console.error("\n❌ Redis test failed:", error.message);
        console.log("\n📋 Troubleshooting steps:");
        console.log("1. Make sure Redis server is installed: redis-cli ping");
        console.log("2. Check Redis is running: sudo systemctl status redis-server");
        console.log("3. Verify .env file has correct Redis configuration");
        console.log("4. Check if port 6379 is available: netstat -tulpn | grep 6379");
        process.exit(1);
    }
}

// Run the test
testRedisConnection();