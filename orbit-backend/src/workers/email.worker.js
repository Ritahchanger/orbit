const queue = require('../utils/queue');
const { processSingleEmail, processEmailBatch } = require('../newsletters/newsletter.service');
const connectDb = require("../config/db.connection");

class EmailWorker {
    constructor() {
        this.isProcessing = false;
    }

    async start() {
        console.log('Starting email workers...');
        
        try {
            // 🔥 CRITICAL: Connect to database first!
            console.log('Connecting to database...');
            await connectDb();
            console.log('✅ Database connected for email worker');

            // Add debug to check queue state before consuming
            console.log('🔍 Checking RabbitMQ connection before consuming...');
            
            // Try to connect explicitly first
            try {
                await queue.connect();
                console.log('✅ RabbitMQ connected successfully');
            } catch (connError) {
                console.error('❌ Failed to connect to RabbitMQ:', connError.message);
                console.error('Full error:', connError);
                throw connError;
            }

            // Check if queues exist
            try {
                // You might need to add these methods to your queue class
                console.log('📋 Checking queues...');
                // This depends on what methods your queue class has
            } catch (queueError) {
                console.error('❌ Queue check failed:', queueError.message);
            }

            // Worker for processing batches
            console.log('⏳ Setting up batch consumer...');
            await queue.consumeFromQueue('newsletter_batches', async (message) => {
                console.log('📦 Processing newsletter batch:', message);
                await processEmailBatch(message);
            });

            // Worker for processing individual emails
            console.log('⏳ Setting up email consumer...');
            await queue.consumeFromQueue('newsletter_emails', async (message) => {
                console.log('📧 Processing individual email:', message?.email);
                await processSingleEmail(message);
            });

            console.log('✅ Email workers started successfully');
            console.log('👂 Listening for messages on:');
            console.log('   - newsletter_batches');
            console.log('   - newsletter_emails');
            
        } catch (error) {
            console.error('❌ Failed to start email workers:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    async stop() {
        console.log('🛑 Stopping email workers...');
        await queue.close();
        console.log('✅ Email workers stopped');
    }
}

// For running as separate process
if (require.main === module) {
    const worker = new EmailWorker();
    
    // Add more process handlers
    process.on('unhandledRejection', (error) => {
        console.error('❌ Unhandled rejection:', error);
    });

    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught exception:', error);
    });

    worker.start().catch(error => {
        console.error('❌ Worker failed to start:', error);
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('🛑 Shutting down email worker...');
        await worker.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('🛑 Shutting down email worker...');
        await worker.stop();
        process.exit(0);
    });
}

module.exports = EmailWorker;