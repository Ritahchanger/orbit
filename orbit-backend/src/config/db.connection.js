// config/db.connection.js
const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false;

const connectDb = async () => {
    try {
        // If already connected, return existing connection
        if (isConnected && mongoose.connection.readyState === 1) {
            console.log('✅ Using existing database connection');
            return mongoose.connection;
        }

        const connection = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/megagamers", {
            maxPoolSize: 10, // Better for multiple workers
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            socketTimeoutMS: 45000, // 45 second socket timeout
        });

        isConnected = true;
        console.log(`✅ Database connected successfully: ${connection.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
            isConnected = false;
        });

        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB reconnected');
            isConnected = true;
        });

        return connection;

    } catch (error) {
        console.error(`❌ Database connection error: ${error.message}`);
        isConnected = false;
        throw error; // Re-throw to handle in caller
    }
}

module.exports = connectDb;