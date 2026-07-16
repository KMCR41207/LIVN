/**
 * MongoDB Connection Module
 * 
 * Establishes and manages MongoDB connections with:
 * - Connection pooling for performance
 * - Error handling and recovery
 * - Event listeners for connection status
 * - Graceful shutdown
 * 
 * Requirements: 7.1-7.8 (User Data Model and Storage)
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Connection pool configuration
 * Mongoose v8+ uses native connection pooling by default
 */
const CONNECTION_CONFIG = {
  maxPoolSize: 10,              // Maximum number of connections in pool
  minPoolSize: 2,               // Minimum connections to keep ready
  maxIdleTimeMS: 45000,         // Close connections idle for 45 seconds
  serverSelectionTimeoutMS: 5000, // Timeout for selecting server
  socketTimeoutMS: 45000,       // Socket timeout for individual operations
  retryWrites: true,            // Enable automatic retry for writes
  retryReads: true,             // Enable automatic retry for reads
  connectTimeoutMS: 10000,      // Initial connection timeout
};

/**
 * MongoDB Connection State
 */
let connectionInstance = null;

/**
 * Connects to MongoDB with connection pooling and error handling
 * 
 * @returns {Promise<Object>} MongoDB connection instance
 * @throws {Error} If connection fails
 * 
 * Requirements:
 * - 7.1: Connects to MongoDB using MONGODB_URI (or MONGO_URI) environment variable
 * - 7.2: Implements connection pooling (maxPoolSize, minPoolSize)
 * - 7.3-7.4: Error handling and recovery mechanisms
 */
async function connectToDatabase() {
  // Return existing connection if already connected
  if (mongoose.connection.readyState === 1) {
    console.log('📊 Using existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error(
        'MongoDB connection URI not found. Please set MONGO_URI or MONGODB_URI environment variable.'
      );
    }

    console.log('🔄 Connecting to MongoDB...');

    // Connect with connection pooling configuration
    await mongoose.connect(mongoUri, {
      ...CONNECTION_CONFIG,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    connectionInstance = mongoose.connection;
    console.log('✅ MongoDB connected successfully');

    // Set up connection event listeners
    setupConnectionListeners();

    return connectionInstance;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

/**
 * Sets up event listeners for connection lifecycle
 * 
 * Requirements:
 * - 7.3: Handles connection errors
 * - 7.4: Provides recovery mechanisms
 */
function setupConnectionListeners() {
  const connection = mongoose.connection;

  /**
   * Connected event - pool is ready
   */
  connection.on('connected', () => {
    console.log('✅ MongoDB: Connected to database');
  });

  /**
   * Disconnected event - all connections closed
   */
  connection.on('disconnected', () => {
    console.log('⚠️  MongoDB: Disconnected from database');
  });

  /**
   * Error event - connection error occurred
   * 
   * Requirement 7.3: Error handling
   */
  connection.on('error', (error) => {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    // Attempt to reconnect after delay
    if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
      console.log('🔄 Attempting to reconnect in 5 seconds...');
      setTimeout(() => {
        reconnectToDatabase().catch(err => {
          console.error('Reconnection failed:', err.message);
        });
      }, 5000);
    }
  });

  /**
   * Reconnected event - connection re-established
   * 
   * Requirement 7.4: Recovery mechanism
   */
  connection.on('reconnected', () => {
    console.log('🔄 MongoDB: Reconnected to database');
  });

  /**
   * Close event - connection pool closed
   */
  connection.on('close', () => {
    console.log('📴 MongoDB: Connection pool closed');
  });

  /**
   * Timeout event - operation timeout
   */
  connection.on('timeout', () => {
    console.error('⏱️  MongoDB: Operation timeout');
  });
}

/**
 * Attempts to reconnect to MongoDB
 * Used when connection is lost
 * 
 * Requirement 7.4: Recovery mechanism
 * 
 * @returns {Promise<Object>} MongoDB connection instance
 */
async function reconnectToDatabase() {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log('🔄 Attempting database reconnection...');
      await mongoose.connect(
        process.env.MONGO_URI || process.env.MONGODB_URI,
        {
          ...CONNECTION_CONFIG,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      console.log('✅ Database reconnected');
    }
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Reconnection failed:', error.message);
    throw error;
  }
}

/**
 * Gets the current MongoDB connection instance
 * 
 * Requirement 7.5: Export connection instance for use in models
 * 
 * @returns {Object} Mongoose connection object
 * @throws {Error} If connection not established
 */
function getConnection() {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection not established. Call connectToDatabase() first.');
  }
  return mongoose.connection;
}

/**
 * Disconnects from MongoDB gracefully
 * Used during server shutdown
 * 
 * Requirement 7.6: Graceful shutdown
 * 
 * @returns {Promise<void>}
 */
async function disconnectDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      console.log('🔌 Disconnecting from MongoDB...');
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  } catch (error) {
    console.error('❌ Disconnect error:', error.message);
    throw error;
  }
}

/**
 * Checks connection health
 * Can be used for health check endpoints
 * 
 * @returns {Object} Connection status information
 */
function getConnectionStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: states[mongoose.connection.readyState],
    ready: mongoose.connection.readyState === 1,
    connected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  };
}

/**
 * Validates connection configuration
 * 
 * Requirement 7.7: Configuration validation
 * 
 * @returns {Object} Validation result
 */
function validateConnectionConfig() {
  const errors = [];

  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    errors.push('MongoDB URI not configured (MONGO_URI or MONGODB_URI)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: {
      maxPoolSize: CONNECTION_CONFIG.maxPoolSize,
      minPoolSize: CONNECTION_CONFIG.minPoolSize,
      retryWrites: CONNECTION_CONFIG.retryWrites,
      retryReads: CONNECTION_CONFIG.retryReads,
    },
  };
}

// Export connection module
module.exports = {
  connectToDatabase,
  reconnectToDatabase,
  disconnectDatabase,
  getConnection,
  getConnectionStatus,
  validateConnectionConfig,
  setupConnectionListeners,
  CONNECTION_CONFIG,
};
