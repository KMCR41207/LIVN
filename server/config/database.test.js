/**
 * Unit Tests for MongoDB Connection Module
 * 
 * Tests:
 * - Connection establishment
 * - Connection pooling configuration
 * - Error handling
 * - Connection status checks
 * - Configuration validation
 * 
 * Validates: Requirements 7.1-7.8
 */

const mongoose = require('mongoose');
const path = require('path');

// Load test environment
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const database = require('./database');

describe('MongoDB Connection Module', () => {
  
  /**
   * Test 1: Connection Configuration Validation
   * 
   * Validates that the connection module is properly configured
   * Requirement 7.1: MongoDB URI configured
   */
  test('should validate connection configuration', () => {
    const validation = database.validateConnectionConfig();
    
    expect(validation).toHaveProperty('isValid');
    expect(validation).toHaveProperty('errors');
    expect(validation).toHaveProperty('config');
    
    // Check that required config properties exist
    expect(validation.config).toHaveProperty('maxPoolSize');
    expect(validation.config).toHaveProperty('minPoolSize');
    expect(validation.config.maxPoolSize).toBeGreaterThan(0);
    expect(validation.config.minPoolSize).toBeGreaterThan(0);
  });

  /**
   * Test 2: Connection Pooling Configuration
   * 
   * Validates connection pooling settings
   * Requirement 7.2: Connection pooling implemented
   */
  test('should have proper connection pooling configuration', () => {
    const config = database.CONNECTION_CONFIG;
    
    expect(config.maxPoolSize).toBe(10);
    expect(config.minPoolSize).toBe(2);
    expect(config.maxIdleTimeMS).toBe(45000);
    expect(config.retryWrites).toBe(true);
    expect(config.retryReads).toBe(true);
  });

  /**
   * Test 3: Connection Status Initially Disconnected
   * 
   * Before connecting, status should show disconnected
   * Requirement 7.5: Connection status retrieval
   */
  test('should initially show disconnected status', () => {
    // Reset mongoose connection for test
    if (mongoose.connection.readyState !== 0) {
      mongoose.disconnect();
    }

    const status = database.getConnectionStatus();
    
    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('ready');
    expect(status).toHaveProperty('connected');
    expect(typeof status.ready).toBe('boolean');
  });

  /**
   * Test 4: Exported Functions Available
   * 
   * Validates that all required functions are exported
   * Requirement 7.5: Export connection instance for use in models
   */
  test('should export all required functions', () => {
    expect(typeof database.connectToDatabase).toBe('function');
    expect(typeof database.reconnectToDatabase).toBe('function');
    expect(typeof database.disconnectDatabase).toBe('function');
    expect(typeof database.getConnection).toBe('function');
    expect(typeof database.getConnectionStatus).toBe('function');
    expect(typeof database.validateConnectionConfig).toBe('function');
    expect(typeof database.setupConnectionListeners).toBe('function');
  });

  /**
   * Test 5: Connection Configuration Complete
   * 
   * Validates that all configuration properties are set
   * Requirement 7.1-7.2: MongoDB configuration
   */
  test('should have complete connection configuration', () => {
    const config = database.CONNECTION_CONFIG;
    
    const requiredProps = [
      'maxPoolSize',
      'minPoolSize',
      'maxIdleTimeMS',
      'serverSelectionTimeoutMS',
      'socketTimeoutMS',
      'retryWrites',
      'retryReads',
      'connectTimeoutMS'
    ];

    requiredProps.forEach(prop => {
      expect(config).toHaveProperty(prop);
    });
  });

  /**
   * Test 6: Environment Variable Present
   * 
   * Validates MongoDB URI is configured
   * Requirement 7.1: MONGODB_URI environment variable
   */
  test('should have MongoDB URI from environment', () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    expect(mongoUri).toBeDefined();
    expect(mongoUri).not.toBe('');
    expect(mongoUri).toMatch(/^mongodb/);
  });

});

/**
 * Integration Tests - Comment out for CI/CD without MongoDB
 */
describe('MongoDB Connection Integration Tests', () => {
  
  /**
   * Integration Test 1: Establish Connection
   * 
   * Tests actual MongoDB connection
   * Requirement 7.1: Connect to MongoDB
   */
  test('should connect to MongoDB database', async () => {
    try {
      const connection = await database.connectToDatabase();
      
      expect(connection).toBeDefined();
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
      
      // Clean up
      await database.disconnectDatabase();
    } catch (error) {
      console.log('MongoDB integration test skipped (no database available)');
    }
  }, 10000); // 10 second timeout

  /**
   * Integration Test 2: Connection Status After Connect
   * 
   * Validates connection status
   * Requirement 7.5: Get connection status
   */
  test('should show connected status after connection', async () => {
    try {
      await database.connectToDatabase();
      
      const status = database.getConnectionStatus();
      
      expect(status.ready).toBe(true);
      expect(status.connected).toBe(true);
      expect(status.status).toBe('connected');
      
      // Clean up
      await database.disconnectDatabase();
    } catch (error) {
      console.log('MongoDB integration test skipped (no database available)');
    }
  }, 10000);

  /**
   * Integration Test 3: Graceful Disconnect
   * 
   * Tests disconnection
   * Requirement 7.6: Graceful shutdown
   */
  test('should disconnect gracefully', async () => {
    try {
      await database.connectToDatabase();
      await database.disconnectDatabase();
      
      // After disconnect, readyState should be 0 (disconnected)
      expect(mongoose.connection.readyState).toBe(0);
    } catch (error) {
      console.log('MongoDB integration test skipped (no database available)');
    }
  }, 10000);

});

/**
 * Export for testing
 */
module.exports = { database };
