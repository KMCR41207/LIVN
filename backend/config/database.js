/**
 * MongoDB Database Connection Module
 * Handles connection pooling, error handling, and retry logic
 * Requirements: 7.1-7.8
 */

const mongoose = require('mongoose');

// Connection configuration
const DB_CONFIG = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority',
};

// Retry configuration with exponential backoff
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
};

/**
 * Connect to MongoDB with retry logic and exponential backoff
 * @param {string} mongoUri - MongoDB connection URI from environment
 * @returns {Promise<void>}
 */
async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  let retries = 0;

  while (retries < RETRY_CONFIG.maxRetries) {
    try {
      console.log(`🔄 Connecting to MongoDB (attempt ${retries + 1}/${RETRY_CONFIG.maxRetries})...`);

      await mongoose.connect(mongoUri, DB_CONFIG);

      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Connection pool size: ${DB_CONFIG.maxPoolSize} (max), ${DB_CONFIG.minPoolSize} (min)`);

      // Set up connection event handlers
      setupConnectionHandlers();

      return;
    } catch (error) {
      retries++;

      if (retries >= RETRY_CONFIG.maxRetries) {
        console.error('❌ MongoDB connection failed after max retries');
        throw new Error(
          `Failed to connect to MongoDB after ${RETRY_CONFIG.maxRetries} attempts: ${error.message}`
        );
      }

      // Calculate exponential backoff delay
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, retries - 1),
        RETRY_CONFIG.maxDelay
      );

      console.warn(`⚠️  Connection failed: ${error.message}`);
      console.warn(`⏳ Retrying in ${delay / 1000} seconds...`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Set up connection event handlers for monitoring
 */
function setupConnectionHandlers() {
  mongoose.connection.on('connected', () => {
    console.log('📡 Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  Mongoose disconnected from MongoDB');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 Mongoose reconnected to MongoDB');
  });
}

/**
 * Disconnect from MongoDB gracefully
 * @returns {Promise<void>}
 */
async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected gracefully');
  } catch (error) {
    console.error('❌ Error during MongoDB disconnection:', error.message);
    throw error;
  }
}

/**
 * Get the MongoDB connection instance
 * @returns {Object} - Mongoose connection object
 */
function getConnection() {
  return mongoose.connection;
}

/**
 * Check if database is connected
 * @returns {boolean} - True if connected, false otherwise
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectToDatabase,
  disconnectDatabase,
  getConnection,
  isConnected,
  mongoose,
};
