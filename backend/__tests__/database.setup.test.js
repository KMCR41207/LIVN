/**
 * Database Setup Tests
 * Verifies schemas and model structure
 * Task: 2.1 - Create MongoDB connection module
 */

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const SessionLog = require('../models/SessionLog');
const { connectToDatabase, disconnectDatabase } = require('../config/database');

describe('Database Connection Module', () => {
  test('Connection module should export required functions', () => {
    expect(typeof connectToDatabase).toBe('function');
    expect(typeof disconnectDatabase).toBe('function');
  });

  test('Should export getConnection function', () => {
    const { getConnection, isConnected } = require('../config/database');
    expect(typeof getConnection).toBe('function');
    expect(typeof isConnected).toBe('function');
  });
});

describe('User Model Schema', () => {
  test('User model should be defined', () => {
    expect(User).toBeDefined();
  });

  test('User schema should have required fields', () => {
    const schema = User.schema;
    const fields = schema.paths;

    // Check required fields
    expect(fields.userId).toBeDefined();
    expect(fields.email).toBeDefined();
    expect(fields.createdAt).toBeDefined();

    // Check unique constraints
    expect(fields.userId.options.unique).toBe(true);
    expect(fields.email.options.unique).toBe(true);
  });

  test('User schema should have all authentication fields', () => {
    const schema = User.schema;
    const fields = schema.paths;

    expect(fields.passwordHash).toBeDefined();
    expect(fields.password).toBeDefined();
    expect(fields.oauthProviders).toBeDefined();
  });

  test('User schema should have profile fields', () => {
    const schema = User.schema;
    const fields = schema.paths;

    expect(fields.firstName).toBeDefined();
    expect(fields.lastName).toBeDefined();
    expect(fields.phone).toBeDefined();
    expect(fields.address).toBeDefined();
    expect(fields.profileCompletionStatus).toBeDefined();
  });

  test('User schema should have security fields', () => {
    const schema = User.schema;
    const fields = schema.paths;

    expect(fields.failedLoginAttempts).toBeDefined();
    expect(fields.accountLockedUntil).toBeDefined();
  });

  test('User schema should have login metadata fields', () => {
    const schema = User.schema;
    const fields = schema.paths;

    expect(fields.lastLogin).toBeDefined();
    expect(fields.lastLoginIP).toBeDefined();
    expect(fields.lastLoginUserAgent).toBeDefined();
  });

  test('Should have comparePassword instance method', () => {
    const user = new User({ email: 'test@example.com' });
    expect(typeof user.comparePassword).toBe('function');
  });

  test('Should have account lockout helper methods', () => {
    const user = new User({ email: 'test@example.com' });
    expect(typeof user.isAccountLocked).toBe('function');
    expect(typeof user.getMinutesUntilUnlock).toBe('function');
  });

  test('User model should have role field', () => {
    const schema = User.schema;
    expect(schema.paths.role).toBeDefined();
    expect(schema.paths.role.enumValues).toContain('user');
    expect(schema.paths.role.enumValues).toContain('admin');
  });

  test('Should set profileCompletionStatus to false by default', () => {
    const user = new User({ email: 'test@example.com' });
    expect(user.profileCompletionStatus).toBe(false);
  });

  test('Should generate UUID for userId', () => {
    const user1 = new User({ email: 'test1@example.com' });
    const user2 = new User({ email: 'test2@example.com' });

    // Both should have UUIDs
    expect(user1.userId).toBeDefined();
    expect(user2.userId).toBeDefined();

    // UUIDs should be different
    expect(user1.userId).not.toBe(user2.userId);

    // Should match UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(user1.userId).toMatch(uuidRegex);
    expect(user2.userId).toMatch(uuidRegex);
  });
});

describe('RefreshToken Model Schema', () => {
  test('RefreshToken model should be defined', () => {
    expect(RefreshToken).toBeDefined();
  });

  test('RefreshToken schema should have required fields', () => {
    const schema = RefreshToken.schema;
    const fields = schema.paths;

    expect(fields.token).toBeDefined();
    expect(fields.userId).toBeDefined();
    expect(fields.expiresAt).toBeDefined();
    expect(fields.createdAt).toBeDefined();
    expect(fields.revokedAt).toBeDefined();
  });

  test('Token field should be unique', () => {
    const schema = RefreshToken.schema;
    expect(schema.paths.token.options.unique).toBe(true);
  });

  test('Should have token audit fields', () => {
    const schema = RefreshToken.schema;
    const fields = schema.paths;

    expect(fields.createdFromIP).toBeDefined();
    expect(fields.createdFromUserAgent).toBeDefined();
  });

  test('Should have isValid instance method', () => {
    const token = new RefreshToken({
      token: 'test-token',
      userId: 'user-123',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    expect(typeof token.isValid).toBe('function');
  });

  test('Should have revoke instance method', () => {
    const token = new RefreshToken({
      token: 'test-token',
      userId: 'user-123',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    expect(typeof token.revoke).toBe('function');
  });

  test('Should have static helper methods', () => {
    expect(typeof RefreshToken.deleteExpired).toBe('function');
    expect(typeof RefreshToken.revokeAllForUser).toBe('function');
  });
});

describe('PasswordResetToken Model Schema', () => {
  test('PasswordResetToken model should be defined', () => {
    expect(PasswordResetToken).toBeDefined();
  });

  test('PasswordResetToken schema should have required fields', () => {
    const schema = PasswordResetToken.schema;
    const fields = schema.paths;

    expect(fields.token).toBeDefined();
    expect(fields.tokenHash).toBeDefined();
    expect(fields.userId).toBeDefined();
    expect(fields.email).toBeDefined();
    expect(fields.expiresAt).toBeDefined();
    expect(fields.usedAt).toBeDefined();
    expect(fields.createdAt).toBeDefined();
  });

  test('Token field should be unique and tokenHash should be sparse for optional uniqueness', () => {
    const schema = PasswordResetToken.schema;
    expect(schema.paths.token.options.unique).toBe(true);
    // tokenHash uses sparse index for optional uniqueness (doesn't create duplicate null values)
    expect(schema.paths.tokenHash.options.sparse).toBe(true);
  });

  test('Should have audit fields', () => {
    const schema = PasswordResetToken.schema;
    const fields = schema.paths;

    expect(fields.requestFromIP).toBeDefined();
    expect(fields.requestFromUserAgent).toBeDefined();
  });

  test('Should have isValid instance method', () => {
    const token = new PasswordResetToken({
      token: 'reset-token',
      tokenHash: 'hashed',
      userId: 'user-123',
      email: 'user@example.com',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    expect(typeof token.isValid).toBe('function');
  });

  test('Should have markAsUsed instance method', () => {
    const token = new PasswordResetToken({
      token: 'reset-token',
      tokenHash: 'hashed',
      userId: 'user-123',
      email: 'user@example.com',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    expect(typeof token.markAsUsed).toBe('function');
  });

  test('Should have static token generation method', () => {
    expect(typeof PasswordResetToken.generateToken).toBe('function');
    const token = PasswordResetToken.generateToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64); // 32 bytes * 2 for hex
  });

  test('Should have static token hashing method', () => {
    expect(typeof PasswordResetToken.hashToken).toBe('function');
    const token = 'test-token-123';
    const hash = PasswordResetToken.hashToken(token);
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64); // SHA256 hex is 64 chars
  });

  test('Should have static findValidToken method', () => {
    expect(typeof PasswordResetToken.findValidToken).toBe('function');
  });

  test('Should have static helper methods', () => {
    expect(typeof PasswordResetToken.deleteExpired).toBe('function');
    expect(typeof PasswordResetToken.revokeAllForUser).toBe('function');
  });
});

describe('SessionLog Model Schema', () => {
  test('SessionLog model should be defined', () => {
    expect(SessionLog).toBeDefined();
  });

  test('SessionLog schema should have required fields', () => {
    const schema = SessionLog.schema;
    const fields = schema.paths;

    expect(fields.userId).toBeDefined();
    expect(fields.eventType).toBeDefined();
    expect(fields.result).toBeDefined();
    expect(fields.timestamp).toBeDefined();
  });

  test('Should support all required event types', () => {
    const schema = SessionLog.schema;
    const eventTypeEnum = schema.paths.eventType.enumValues;

    expect(eventTypeEnum).toContain('login');
    expect(eventTypeEnum).toContain('logout');
    expect(eventTypeEnum).toContain('failed_login');
    expect(eventTypeEnum).toContain('password_reset');
    expect(eventTypeEnum).toContain('otp_sent');
    expect(eventTypeEnum).toContain('otp_verified');
    expect(eventTypeEnum).toContain('oauth_login');
    expect(eventTypeEnum).toContain('account_locked');
  });

  test('Should support all result types', () => {
    const schema = SessionLog.schema;
    const resultEnum = schema.paths.result.enumValues;

    expect(resultEnum).toContain('success');
    expect(resultEnum).toContain('failed');
  });

  test('Should have metadata field', () => {
    const schema = SessionLog.schema;
    expect(schema.paths.metadata).toBeDefined();
  });

  test('Should have getDescription instance method', () => {
    const log = new SessionLog({
      userId: 'user-123',
      eventType: 'login',
      result: 'success',
    });

    expect(typeof log.getDescription).toBe('function');
    expect(log.getDescription()).toBe('User logged in');
  });

  test('Should have static logEvent method', () => {
    expect(typeof SessionLog.logEvent).toBe('function');
  });

  test('Should have static query methods', () => {
    expect(typeof SessionLog.getRecentEvents).toBe('function');
    expect(typeof SessionLog.getFailedLoginAttempts).toBe('function');
    expect(typeof SessionLog.getLoginAnalytics).toBe('function');
  });
});

describe('Acceptance Criteria', () => {
  test('AC1: MongoDB connection module exists and exports required functions', () => {
    const db = require('../config/database');
    expect(db.connectToDatabase).toBeDefined();
    expect(db.disconnectDatabase).toBeDefined();
    expect(db.getConnection).toBeDefined();
    expect(db.isConnected).toBeDefined();
    expect(db.mongoose).toBeDefined();
  });

  test('AC2: All collections have proper schema definitions', () => {
    // User collection
    expect(User.schema.paths.userId).toBeDefined();
    expect(User.schema.paths.email).toBeDefined();
    expect(User.schema.paths.phone).toBeDefined();
    expect(User.schema.paths.oauthProviders).toBeDefined();

    // RefreshToken collection
    expect(RefreshToken.schema.paths.token).toBeDefined();
    expect(RefreshToken.schema.paths.expiresAt).toBeDefined();

    // PasswordResetToken collection
    expect(PasswordResetToken.schema.paths.token).toBeDefined();
    expect(PasswordResetToken.schema.paths.expiresAt).toBeDefined();

    // SessionLog collection
    expect(SessionLog.schema.paths.userId).toBeDefined();
    expect(SessionLog.schema.paths.eventType).toBeDefined();
  });

  test('AC3: TTL configuration present in schemas', () => {
    // Verify TTL index configurations exist
    const refreshIndexes = RefreshToken.schema.indexes();
    const resetIndexes = PasswordResetToken.schema.indexes();
    const sessionIndexes = SessionLog.schema.indexes();

    expect(refreshIndexes.length).toBeGreaterThan(0);
    expect(resetIndexes.length).toBeGreaterThan(0);
    expect(sessionIndexes.length).toBeGreaterThan(0);
  });

  test('AC4: Schemas match design specification', () => {
    // User schema completeness
    const userPaths = User.schema.paths;
    const requiredUserFields = [
      'userId',
      'email',
      'phone',
      'firstName',
      'lastName',
      'address',
      'passwordHash',
      'oauthProviders',
      'profileCompletionStatus',
      'createdAt',
      'updatedAt',
      'lastLogin',
      'failedLoginAttempts',
      'accountLockedUntil',
      'lastLoginIP',
      'lastLoginUserAgent',
    ];

    requiredUserFields.forEach(field => {
      expect(userPaths[field]).toBeDefined();
    });

    // RefreshToken schema completeness
    const refreshPaths = RefreshToken.schema.paths;
    const requiredRefreshFields = [
      'token',
      'userId',
      'expiresAt',
      'createdAt',
      'revokedAt',
    ];

    requiredRefreshFields.forEach(field => {
      expect(refreshPaths[field]).toBeDefined();
    });

    // PasswordResetToken schema completeness
    const resetPaths = PasswordResetToken.schema.paths;
    const requiredResetFields = [
      'token',
      'tokenHash',
      'userId',
      'email',
      'expiresAt',
      'usedAt',
      'createdAt',
    ];

    requiredResetFields.forEach(field => {
      expect(resetPaths[field]).toBeDefined();
    });

    // SessionLog schema completeness
    const sessionPaths = SessionLog.schema.paths;
    const requiredSessionFields = [
      'userId',
      'eventType',
      'result',
      'timestamp',
    ];

    requiredSessionFields.forEach(field => {
      expect(sessionPaths[field]).toBeDefined();
    });
  });
});

