const amqp = require("amqplib");

class RabbitMQ {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      // Try multiple connection strategies
      const connectionStrategies = [
        // Strategy 1: URL string (current)
        async () => {
          const url =
            process.env.RABBITMQ_URL ||
            "amqp://orbitmq:strongpass123@localhost:5672";
          console.log("🔍 Strategy 1: Connecting with URL");
          return await amqp.connect(url);
        },

        // Strategy 2: URL with encoded vhost
        async () => {
          const url =
            process.env.RABBITMQ_URL ||
            "amqp://orbitmq:strongpass123@localhost:5672/%2F";
          console.log("🔍 Strategy 2: Connecting with URL + encoded vhost");
          return await amqp.connect(url);
        },

        // Strategy 3: Connection options object (most reliable)
        async () => {
          console.log("🔍 Strategy 3: Connecting with options object");
          return await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST || "localhost",
            port: parseInt(process.env.RABBITMQ_PORT) || 5672,
            username: process.env.RABBITMQ_USER || "orbitmq",
            password: process.env.RABBITMQ_PASS || "strongpass123",
            vhost: process.env.RABBITMQ_VHOST || "/",
            heartbeat: 60,
            timeout: 10000,
          });
        },

        // Strategy 4: Try localhost with default guest (for testing)
        async () => {
          console.log("🔍 Strategy 4: Testing with guest account");
          return await amqp.connect("amqp://guest:guest@localhost:5672");
        },
      ];

      let lastError = null;

      // Try each strategy until one works
      for (let i = 0; i < connectionStrategies.length; i++) {
        try {
          this.connection = await connectionStrategies[i]();
          console.log(`✅ Connected with strategy ${i + 1}`);
          break;
        } catch (err) {
          lastError = err;
          console.log(`❌ Strategy ${i + 1} failed: ${err.message}`);

          // If this is the last strategy, throw the error
          if (i === connectionStrategies.length - 1) {
            throw lastError;
          }
        }
      }

      // Set up connection error handlers
      this.connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err.message);
        this.isConnected = false;
        this.attemptReconnect();
      });

      this.connection.on("close", () => {
        console.log("RabbitMQ connection closed");
        this.isConnected = false;
        this.attemptReconnect();
      });

      // Create channel
      this.channel = await this.connection.createChannel();
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Assert queues
      await this.channel.assertQueue("newsletter_emails", { durable: true });
      await this.channel.assertQueue("newsletter_batches", { durable: true });

      console.log("✅ Connected to RabbitMQ successfully");
      console.log("📨 Queues ready: newsletter_emails, newsletter_batches");

      return this.channel;
    } catch (error) {
      console.error("❌ All RabbitMQ connection strategies failed:");
      console.error("   Error:", error.message);

      // Log detailed troubleshooting info
      console.error("\n🔧 Troubleshooting Guide:");
      console.error("1. Check if RabbitMQ is running:");
      console.error("   sudo systemctl status rabbitmq-server");
      console.error("2. Verify credentials:");
      console.error(
        "   sudo rabbitmqctl authenticate_user orbitmq strongpass123",
      );
      console.error("3. Check permissions:");
      console.error("   sudo rabbitmqctl list_user_permissions orbitmq");
      console.error("4. View RabbitMQ logs:");
      console.error("   sudo tail -f /var/log/rabbitmq/rabbit@yourhost.log");
      console.error("5. Try connecting with guest account:");
      console.error("   sudo rabbitmqctl authenticate_user guest guest");

      throw error;
    }
  }

  async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(
      `🔄 Reconnecting in ${delay / 1000}s... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(() => {
      this.connect().catch(() => {});
    }, delay);
  }

  async publishToQueue(queueName, message) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const result = this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );

      console.log(`📤 Published message to ${queueName}:`, result);
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to publish to queue ${queueName}:`,
        error.message,
      );
      throw error;
    }
  }

  async consumeFromQueue(queue, callback) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      await this.channel.prefetch(1);

      const consumer = await this.channel.consume(queue, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`📥 Received message from ${queue}`);

            await callback(content);

            this.channel.ack(msg);
            console.log(`✅ Message processed and acknowledged`);
          } catch (error) {
            console.error(
              `❌ Error processing message from ${queue}:`,
              error.message,
            );
            // Reject and requeue
            this.channel.nack(msg, false, true);
          }
        }
      });

      console.log(`👂 Listening on queue: ${queue}`);
      return consumer;
    } catch (error) {
      console.error(`❌ Failed to consume from queue ${queue}:`, error.message);
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        console.log("✅ Channel closed");
      }

      if (this.connection) {
        await this.connection.close();
        console.log("✅ Connection closed");
      }

      this.isConnected = false;
    } catch (error) {
      console.error("❌ Error closing RabbitMQ connection:", error.message);
    }
  }

  async checkQueueStatus(queueName) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const queueInfo = await this.channel.checkQueue(queueName);
      console.log(`📊 Queue ${queueName} status:`, {
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount,
      });

      return queueInfo;
    } catch (error) {
      console.error(`❌ Failed to check queue ${queueName}:`, error.message);
      throw error;
    }
  }
}

module.exports = new RabbitMQ();
