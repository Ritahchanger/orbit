const queue = require('../utils/queue');
const { processSingleEmail, processEmailBatch } = require('../newsletters/services/newsletter.service');
const connectDb = require("../config/db.connection");
const log = require("../utils/log");

class EmailWorker {
    constructor() {
        this.isProcessing = false;
    }

    async start() {
        log.info('Starting email workers...');
        
        try {
            // 🔥 CRITICAL: Connect to database first!
            log.info('Connecting to database...');
            await connectDb();
            log.info('✅ Database connected for email worker');

            // Add debug to check queue state before consuming
            log.info('🔍 Checking RabbitMQ connection before consuming...');
            
            // Try to connect explicitly first
            try {
                await queue.connect();
                log.info('✅ RabbitMQ connected successfully');
            } catch (connError) {
                console.error('❌ Failed to connect to RabbitMQ:', connError.message);
                console.error('Full error:', connError);
                throw connError;
            }

            // Check if queues exist
            try {
                // You might need to add these methods to your queue class
                log.info('📋 Checking queues...');
                // This depends on what methods your queue class has
            } catch (queueError) {
                console.error('❌ Queue check failed:', queueError.message);
            }

            // Worker for processing batches
            log.info('⏳ Setting up batch consumer...');
            await queue.consumeFromQueue('newsletter_batches', async (message) => {
                log.info('📦 Processing newsletter batch:', message);
                await processEmailBatch(message);
            });

            // Worker for processing individual emails
            log.info('⏳ Setting up email consumer...');
            await queue.consumeFromQueue('newsletter_emails', async (message) => {
                log.info('📧 Processing individual email:', message?.email);
                await processSingleEmail(message);
            });

            log.info('✅ Email workers started successfully');
            log.info('👂 Listening for messages on:');
            log.info('   - newsletter_batches');
            log.info('   - newsletter_emails');
            
        } catch (error) {
            console.error('❌ Failed to start email workers:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    async stop() {
        log.info('🛑 Stopping email workers...');
        await queue.close();
        log.info('✅ Email workers stopped');
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
        log.info('🛑 Shutting down email worker...');
        await worker.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        log.info('🛑 Shutting down email worker...');
        await worker.stop();
        process.exit(0);
    });
}

module.exports = EmailWorker;