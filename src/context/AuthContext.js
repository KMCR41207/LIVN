import { createContext } from 'react';

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} [name] - User name
 * @property {string} [role] - User role (admin, user, etc)
 * @property {string} [phone] - User phone number
 * @property {Object} [profile] - User profile data
 */

/**
 * @typedef {Object} AuthError
 * @property {string} message - Error message
 * @property {string} [code] - Error code
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User | null} currentUser - Current authenticated user
 * @property {boolean} isLoading - Loading state
 * @property {AuthError | null} error - Current error
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {string | null} accessToken - JWT access token
 * @property {string | null} refreshToken - Refresh token
 * @property {number | null} tokenExpiry - Token expiry timestamp
 * @property {(email: string, password: string) => Promise<void>} login - Login with email/password
 * @property {(email: string, password: string) => Promise<void>} signupEmail - Sign up with email/password
 * @property {(firebaseToken: string) => Promise<void>} loginWithGoogle - Login with Google
 * @property {(firebaseToken: string) => Promise<void>} loginWithFacebook - Login with Facebook
 * @property {(phoneNumber: string, country: string) => Promise<void>} loginWithPhone - Login with phone
 * @property {(phoneNumber: string, otp: string) => Promise<void>} verifyOTP - Verify OTP
 * @property {(profileData: Object) => Promise<void>} completeProfile - Complete user profile
 * @property {() => Promise<void>} refreshAccessToken - Refresh access token
 * @property {() => Promise<void>} logout - Logout user
 * @property {(email: string) => Promise<void>} resetPassword - Reset password
 */

export const AuthContext = createContext(null);

AuthContext.displayName = 'AuthContext';
