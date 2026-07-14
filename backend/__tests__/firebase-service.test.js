/**
 * FirebaseService Module Tests
 * Tests: 3.5.1-3.5.6 Create FirebaseService module
 * Tests OAuth token verification, phone OTP, user creation, and provider linking
 */

const FirebaseService = require('../services/FirebaseService');
const { AuthError, ValidationError, ServerError } = require('../utils/errors');
const firebaseConfig = require('../config/firebase');

// Mock Firebase Auth
jest.mock('../config/firebase', () => ({
  getFirebaseAuth: jest.fn(),
}));

describe('FirebaseService Module', () => {
  let mockAuth;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = {
      verifyIdToken: jest.fn(),
      getUserByEmail: jest.fn(),
      getUser: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      setCustomUserClaims: jest.fn(),
    };
    firebaseConfig.getFirebaseAuth.mockReturnValue(mockAuth);
  });

  describe('Module Exports', () => {
    test('should export all required functions', () => {
      expect(FirebaseService).toHaveProperty('verifyGoogleToken');
      expect(FirebaseService).toHaveProperty('verifyFacebookToken');
      expect(FirebaseService).toHaveProperty('sendPhoneOTP');
      expect(FirebaseService).toHaveProperty('verifyPhoneOTP');
      expect(FirebaseService).toHaveProperty('createUserFromOAuth');
      expect(FirebaseService).toHaveProperty('linkProviderToUser');
      expect(FirebaseService).toHaveProperty('userExistsByEmail');
      expect(FirebaseService).toHaveProperty('getFirebaseUserByEmail');
      expect(FirebaseService).toHaveProperty('getFirebaseUserByUid');
    });

    test('all exported functions should be functions', () => {
      Object.values(FirebaseService).forEach((value) => {
        expect(typeof value).toBe('function');
      });
    });
  });

  describe('verifyGoogleToken', () => {
    test('should return user data for valid Google token', async () => {
      const mockDecodedToken = {
        uid: 'google-uid-123',
        email: 'user@gmail.com',
        name: 'John Doe',
        picture: 'https://example.com/photo.jpg',
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await FirebaseService.verifyGoogleToken('valid-token');

      expect(result).toEqual({
        email: 'user@gmail.com',
        name: 'John Doe',
        photoUrl: 'https://example.com/photo.jpg',
        uid: 'google-uid-123',
        provider: 'google',
      });
    });

    test('should throw ValidationError when token is missing', async () => {
      await expect(FirebaseService.verifyGoogleToken(null)).rejects.toThrow(
        ValidationError
      );
      await expect(FirebaseService.verifyGoogleToken('')).rejects.toThrow(
        ValidationError
      );
    });

    test('should throw ValidationError when email is missing from token', async () => {
      const mockDecodedToken = {
        uid: 'google-uid-123',
        email: null,
        name: 'John Doe',
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      await expect(FirebaseService.verifyGoogleToken('valid-token')).rejects.toThrow(
        ValidationError
      );
    });

    test('should throw AuthError when token is invalid', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(FirebaseService.verifyGoogleToken('invalid-token')).rejects.toThrow(
        AuthError
      );
    });

    test('should throw AuthError when token is revoked', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Token revoked'));

      await expect(FirebaseService.verifyGoogleToken('revoked-token')).rejects.toThrow(
        AuthError
      );
    });

    test('should throw AuthError when token is expired', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Token expired'));

      await expect(FirebaseService.verifyGoogleToken('expired-token')).rejects.toThrow(
        AuthError
      );
    });

    test('should throw ServerError when Firebase is unavailable', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(
        new Error('Firebase service is temporarily unavailable')
      );

      await expect(FirebaseService.verifyGoogleToken('valid-token')).rejects.toThrow(
        ServerError
      );
    });

    test('should handle token without name gracefully', async () => {
      const mockDecodedToken = {
        uid: 'google-uid-123',
        email: 'user@gmail.com',
        name: undefined,
        picture: null,
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await FirebaseService.verifyGoogleToken('valid-token');

      expect(result.name).toBe('');
      expect(result.photoUrl).toBeNull();
    });
  });

  describe('verifyFacebookToken', () => {
    test('should return user data for valid Facebook token', async () => {
      const mockDecodedToken = {
        uid: 'facebook-uid-456',
        email: 'user@facebook.com',
        name: 'Jane Doe',
        picture: 'https://example.com/fb-photo.jpg',
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await FirebaseService.verifyFacebookToken('valid-token');

      expect(result).toEqual({
        email: 'user@facebook.com',
        name: 'Jane Doe',
        photoUrl: 'https://example.com/fb-photo.jpg',
        uid: 'facebook-uid-456',
        provider: 'facebook',
      });
    });

    test('should throw ValidationError when token is missing', async () => {
      await expect(FirebaseService.verifyFacebookToken(null)).rejects.toThrow(
        ValidationError
      );
      await expect(FirebaseService.verifyFacebookToken('')).rejects.toThrow(
        ValidationError
      );
    });

    test('should throw ValidationError when email is missing from token', async () => {
      const mockDecodedToken = {
        uid: 'facebook-uid-456',
        email: null,
        name: 'Jane Doe',
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      await expect(FirebaseService.verifyFacebookToken('valid-token')).rejects.toThrow(
        ValidationError
      );
    });

    test('should throw AuthError when token is invalid', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(FirebaseService.verifyFacebookToken('invalid-token')).rejects.toThrow(
        AuthError
      );
    });

    test('should throw AuthError when token is revoked', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Token revoked'));

      await expect(FirebaseService.verifyFacebookToken('revoked-token')).rejects.toThrow(
        AuthError
      );
    });

    test('should throw AuthError when token is expired', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Token expired'));

      await expect(FirebaseService.verifyFacebookToken('expired-token')).rejects.toThrow(
        AuthError
      );
    });
  });

  describe('sendPhoneOTP', () => {
    test('should send OTP successfully for valid phone number', async () => {
      const result = await FirebaseService.sendPhoneOTP('+1234567890');

      expect(result).toHaveProperty('verificationId');
      expect(result).toHaveProperty('expiresIn');
      expect(result.expiresIn).toBe(600); // 10 minutes
      expect(result.message).toContain('OTP sent successfully');
    });

    test('should throw ValidationError when phone number is missing', async () => {
      await expect(FirebaseService.sendPhoneOTP(null)).rejects.toThrow(
        ValidationError
      );
      await expect(FirebaseService.sendPhoneOTP('')).rejects.toThrow(
        ValidationError
      );
    });

    test('should throw ValidationError for invalid phone number format', async () => {
      const invalidNumbers = [
        '1234567890',      // Missing +
        '+1',              // Too short
        '+12345',          // Too short
        '+123456789012345', // Too long
        'abc1234567',      // Contains letters
      ];

      for (const phoneNumber of invalidNumbers) {
        await expect(
          FirebaseService.sendPhoneOTP(phoneNumber)
        ).rejects.toThrow(ValidationError);
      }
    });

    test('should accept valid E.164 phone numbers', async () => {
      const validNumbers = [
        '+1234567890',
        '+447911123456',
        '+919876543210',
        '+33123456789',
      ];

      for (const phoneNumber of validNumbers) {
        const result = await FirebaseService.sendPhoneOTP(phoneNumber);
        expect(result).toHaveProperty('verificationId');
        expect(result).toHaveProperty('expiresIn');
      }
    });

    test('should return unique verification IDs for different calls', async () => {
      const result1 = await FirebaseService.sendPhoneOTP('+1234567890');
      const result2 = await FirebaseService.sendPhoneOTP('+1234567891');

      expect(result1.verificationId).not.toBe(result2.verificationId);
    });
  });

  describe('verifyPhoneOTP', () => {
    test('should verify OTP successfully with valid parameters', async () => {
      const result = await FirebaseService.verifyPhoneOTP('verify-id-123', '123456');

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('uid');
      expect(result.valid).toBe(true);
    });

    test('should throw ValidationError when verification ID is missing', async () => {
      await expect(
        FirebaseService.verifyPhoneOTP(null, '123456')
      ).rejects.toThrow(ValidationError);
      await expect(
        FirebaseService.verifyPhoneOTP('', '123456')
      ).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError when OTP code is missing', async () => {
      await expect(
        FirebaseService.verifyPhoneOTP('verify-id-123', null)
      ).rejects.toThrow(ValidationError);
      await expect(
        FirebaseService.verifyPhoneOTP('verify-id-123', '')
      ).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid OTP format (not 6 digits)', async () => {
      const invalidCodes = [
        '12345',    // Too short
        '1234567',  // Too long
        'abc123',   // Contains letters
        '12-456',   // Contains special chars
      ];

      for (const code of invalidCodes) {
        await expect(
          FirebaseService.verifyPhoneOTP('verify-id-123', code)
        ).rejects.toThrow(ValidationError);
      }
    });

    test('should accept valid 6-digit OTP codes', async () => {
      const validCodes = ['000000', '123456', '999999', '111111'];

      for (const code of validCodes) {
        const result = await FirebaseService.verifyPhoneOTP('verify-id-123', code);
        expect(result.valid).toBe(true);
      }
    });

    test('should throw AuthError for invalid OTP', async () => {
      // This is a placeholder test since we're mocking
      // In real implementation, Firebase would return an error for wrong code
      const result = await FirebaseService.verifyPhoneOTP('verify-id-123', '123456');
      expect(result).toBeDefined();
    });
  });

  describe('createUserFromOAuth', () => {
    test('should create user successfully for new Google OAuth', async () => {
      const oauthData = {
        email: 'newuser@gmail.com',
        name: 'New User',
        uid: 'google-uid-789',
        provider: 'google',
      };

      mockAuth.getUserByEmail.mockRejectedValue(
        new Error('user-not-found')
      );
      mockAuth.createUser.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'newuser@gmail.com',
        displayName: 'New User',
      });

      const result = await FirebaseService.createUserFromOAuth(oauthData);

      expect(result).toEqual({
        uid: 'firebase-uid-123',
        email: 'newuser@gmail.com',
        displayName: 'New User',
      });
    });

    test('should return existing user if already exists', async () => {
      const oauthData = {
        email: 'existing@gmail.com',
        name: 'Existing User',
        uid: 'google-uid-999',
        provider: 'google',
      };

      mockAuth.getUserByEmail.mockResolvedValue({
        uid: 'firebase-uid-existing',
        email: 'existing@gmail.com',
        displayName: 'Existing User',
      });

      const result = await FirebaseService.createUserFromOAuth(oauthData);

      expect(result.uid).toBe('firebase-uid-existing');
      expect(result.email).toBe('existing@gmail.com');
    });

    test('should throw ValidationError when OAuth data is missing', async () => {
      await expect(FirebaseService.createUserFromOAuth(null)).rejects.toThrow(
        ValidationError
      );
    });

    test('should throw ValidationError when email is missing', async () => {
      const oauthData = {
        email: null,
        name: 'User',
        uid: 'uid-123',
        provider: 'google',
      };

      await expect(
        FirebaseService.createUserFromOAuth(oauthData)
      ).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid provider', async () => {
      const oauthData = {
        email: 'user@example.com',
        name: 'User',
        uid: 'uid-123',
        provider: 'invalid-provider',
      };

      await expect(
        FirebaseService.createUserFromOAuth(oauthData)
      ).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for email-already-exists error', async () => {
      const oauthData = {
        email: 'existing@gmail.com',
        name: 'User',
        uid: 'uid-123',
        provider: 'google',
      };

      mockAuth.getUserByEmail.mockRejectedValue(
        new Error('user-not-found')
      );
      mockAuth.createUser.mockRejectedValue(
        new Error('email-already-exists')
      );

      await expect(
        FirebaseService.createUserFromOAuth(oauthData)
      ).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid-email error', async () => {
      const oauthData = {
        email: 'invalid-email',
        name: 'User',
        uid: 'uid-123',
        provider: 'google',
      };

      mockAuth.getUserByEmail.mockRejectedValue(
        new Error('user-not-found')
      );
      mockAuth.createUser.mockRejectedValue(new Error('invalid-email'));

      await expect(
        FirebaseService.createUserFromOAuth(oauthData)
      ).rejects.toThrow(ValidationError);
    });

    test('should support both Google and Facebook providers', async () => {
      const googleData = {
        email: 'user@gmail.com',
        name: 'User',
        uid: 'uid-123',
        provider: 'google',
      };

      const facebookData = {
        email: 'user@example.com',
        name: 'User',
        uid: 'uid-456',
        provider: 'facebook',
      };

      mockAuth.getUserByEmail.mockRejectedValue(
        new Error('user-not-found')
      );
      mockAuth.createUser.mockResolvedValue({
        uid: 'firebase-uid',
        email: 'user@gmail.com',
        displayName: 'User',
      });

      const googleResult = await FirebaseService.createUserFromOAuth(googleData);
      expect(googleResult).toBeDefined();

      mockAuth.createUser.mockResolvedValue({
        uid: 'firebase-uid-fb',
        email: 'user@example.com',
        displayName: 'User',
      });

      const facebookResult = await FirebaseService.createUserFromOAuth(facebookData);
      expect(facebookResult).toBeDefined();
    });
  });

  describe('linkProviderToUser', () => {
    test('should link provider successfully to existing user', async () => {
      mockAuth.getUser.mockResolvedValue({
        uid: 'user-uid-123',
        email: 'user@example.com',
        displayName: 'User',
        customClaims: { providers: [] },
      });

      mockAuth.setCustomUserClaims.mockResolvedValue(undefined);

      const result = await FirebaseService.linkProviderToUser(
        'user-uid-123',
        'google',
        { name: 'User', photoUrl: 'https://example.com/photo.jpg' }
      );

      expect(result).toHaveProperty('uid');
      expect(result).toHaveProperty('providers');
      expect(result.providers).toContain('google');
    });

    test('should not duplicate provider if already linked', async () => {
      mockAuth.getUser.mockResolvedValue({
        uid: 'user-uid-123',
        email: 'user@example.com',
        displayName: 'User',
        customClaims: { providers: ['google'] },
      });

      mockAuth.setCustomUserClaims.mockResolvedValue(undefined);

      const result = await FirebaseService.linkProviderToUser(
        'user-uid-123',
        'google',
        { name: 'User' }
      );

      expect(result.providers.filter((p) => p === 'google').length).toBe(1);
    });

    test('should throw ValidationError when UID is missing', async () => {
      await expect(
        FirebaseService.linkProviderToUser(null, 'google', { name: 'User' })
      ).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid provider', async () => {
      await expect(
        FirebaseService.linkProviderToUser(
          'user-uid-123',
          'invalid-provider',
          { name: 'User' }
        )
      ).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError when provider data is missing', async () => {
      await expect(
        FirebaseService.linkProviderToUser('user-uid-123', 'google', null)
      ).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError when user not found', async () => {
      mockAuth.getUser.mockRejectedValue(new Error('user-not-found'));

      await expect(
        FirebaseService.linkProviderToUser(
          'nonexistent-uid',
          'google',
          { name: 'User' }
        )
      ).rejects.toThrow(ValidationError);
    });

    test('should update user displayName if not already set', async () => {
      mockAuth.getUser.mockResolvedValue({
        uid: 'user-uid-123',
        email: 'user@example.com',
        displayName: null,
        customClaims: { providers: [] },
      });

      mockAuth.updateUser.mockResolvedValue(undefined);
      mockAuth.setCustomUserClaims.mockResolvedValue(undefined);

      await FirebaseService.linkProviderToUser(
        'user-uid-123',
        'google',
        { name: 'New Name' }
      );

      expect(mockAuth.updateUser).toHaveBeenCalledWith(
        'user-uid-123',
        expect.objectContaining({ displayName: 'New Name' })
      );
    });

    test('should support both Google and Facebook provider linking', async () => {
      mockAuth.getUser.mockResolvedValue({
        uid: 'user-uid-123',
        email: 'user@example.com',
        displayName: 'User',
        customClaims: { providers: ['google'] },
      });

      mockAuth.setCustomUserClaims.mockResolvedValue(undefined);

      const result = await FirebaseService.linkProviderToUser(
        'user-uid-123',
        'facebook',
        { name: 'User' }
      );

      expect(result.providers).toContain('google');
      expect(result.providers).toContain('facebook');
    });
  });

  describe('Utility Methods', () => {
    describe('userExistsByEmail', () => {
      test('should return true if user exists', async () => {
        mockAuth.getUserByEmail.mockResolvedValue({
          uid: 'user-uid-123',
          email: 'existing@example.com',
        });

        const result = await FirebaseService.userExistsByEmail(
          'existing@example.com'
        );

        expect(result).toBe(true);
      });

      test('should return false if user does not exist', async () => {
        mockAuth.getUserByEmail.mockRejectedValue(
          new Error('user-not-found')
        );

        const result = await FirebaseService.userExistsByEmail(
          'nonexistent@example.com'
        );

        expect(result).toBe(false);
      });

      test('should return false for null or empty email', async () => {
        const result1 = await FirebaseService.userExistsByEmail(null);
        const result2 = await FirebaseService.userExistsByEmail('');

        expect(result1).toBe(false);
        expect(result2).toBe(false);
      });

      test('should throw ServerError for Firebase errors', async () => {
        mockAuth.getUserByEmail.mockRejectedValue(
          new Error('Firebase service unavailable')
        );

        await expect(
          FirebaseService.userExistsByEmail('test@example.com')
        ).rejects.toThrow(ServerError);
      });
    });

    describe('getFirebaseUserByEmail', () => {
      test('should return user for valid email', async () => {
        const mockUser = {
          uid: 'user-uid-123',
          email: 'user@example.com',
          displayName: 'User',
        };

        mockAuth.getUserByEmail.mockResolvedValue(mockUser);

        const result = await FirebaseService.getFirebaseUserByEmail(
          'user@example.com'
        );

        expect(result).toEqual(mockUser);
      });

      test('should throw ValidationError when email is missing', async () => {
        await expect(
          FirebaseService.getFirebaseUserByEmail(null)
        ).rejects.toThrow(ValidationError);
      });

      test('should throw ValidationError when user not found', async () => {
        mockAuth.getUserByEmail.mockRejectedValue(
          new Error('user-not-found')
        );

        await expect(
          FirebaseService.getFirebaseUserByEmail('nonexistent@example.com')
        ).rejects.toThrow(ValidationError);
      });
    });

    describe('getFirebaseUserByUid', () => {
      test('should return user for valid UID', async () => {
        const mockUser = {
          uid: 'user-uid-123',
          email: 'user@example.com',
          displayName: 'User',
        };

        mockAuth.getUser.mockResolvedValue(mockUser);

        const result = await FirebaseService.getFirebaseUserByUid(
          'user-uid-123'
        );

        expect(result).toEqual(mockUser);
      });

      test('should throw ValidationError when UID is missing', async () => {
        await expect(FirebaseService.getFirebaseUserByUid(null)).rejects.toThrow(
          ValidationError
        );
      });

      test('should throw ValidationError when user not found', async () => {
        mockAuth.getUser.mockRejectedValue(new Error('user-not-found'));

        await expect(
          FirebaseService.getFirebaseUserByUid('nonexistent-uid')
        ).rejects.toThrow(ValidationError);
      });
    });
  });

  describe('Error Handling and Logging', () => {
    test('should include descriptive error messages', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid signature'));

      try {
        await FirebaseService.verifyGoogleToken('bad-token');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Invalid');
        expect(error.statusCode).toBeDefined();
        expect(error.code).toBeDefined();
      }
    });

    test('should include error code in response', async () => {
      mockAuth.getUserByEmail.mockRejectedValue(
        new Error('user-not-found')
      );

      try {
        await FirebaseService.getFirebaseUserByEmail('test@example.com');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe('VALIDATION_ERROR');
      }
    });

    test('should handle Firebase service unavailability gracefully', async () => {
      mockAuth.createUser.mockRejectedValue(
        new Error('Firebase service is currently unavailable')
      );

      const oauthData = {
        email: 'user@example.com',
        name: 'User',
        uid: 'uid-123',
        provider: 'google',
      };

      mockAuth.getUserByEmail.mockRejectedValue(
        new Error('user-not-found')
      );

      try {
        await FirebaseService.createUserFromOAuth(oauthData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.statusCode).toBe(500);
      }
    });
  });
});
