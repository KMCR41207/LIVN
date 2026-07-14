/**
 * Firebase Admin SDK Initialization Module
 * Handles Firebase service account initialization, credential loading, and error handling
 * Requirements: Design Backend Architecture, 2.2, 3.2
 */

const admin = require('firebase-admin');

/**
 * Validate that all required Firebase credentials are set in environment variables
 * @throws {Error} If any required environment variable is missing
 */
function validateFirebaseCredentials() {
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Firebase initialization failed: Missing required environment variables: ${missingVars.join(', ')}. ` +
      `Please set these in your .env file or environment before starting the server.`
    );
  }

  console.log('✅ All required Firebase environment variables are set');
}

/**
 * Initialize Firebase Admin SDK with service account credentials from environment variables
 * This function is called once during server startup
 * 
 * @returns {admin.app.App} - Initialized Firebase app instance
 * @throws {Error} If credentials are missing or initialization fails
 */
function initializeFirebaseAdmin() {
  try {
    // Validate that all required credentials are present
    validateFirebaseCredentials();

    // Build the service account credentials object from environment variables
    // The FIREBASE_PRIVATE_KEY may contain escape sequences, so parse it if it's a string with \n
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    };

    // Initialize the Firebase Admin SDK app
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`📊 Firebase Project ID: ${process.env.FIREBASE_PROJECT_ID}`);

    return app;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error('❌ Firebase initialization failed:', errorMessage);

    // Provide helpful context for common errors
    if (errorMessage.includes('FIREBASE_PRIVATE_KEY')) {
      console.error(
        '💡 Hint: Ensure FIREBASE_PRIVATE_KEY is properly set in your .env file. ' +
        'It should be a complete private key with \\n escapes.'
      );
    }

    if (errorMessage.includes('Cannot find module')) {
      console.error(
        '💡 Hint: The firebase-admin package may not be installed. ' +
        'Run: npm install firebase-admin'
      );
    }

    throw new Error(
      `Firebase Admin SDK initialization failed. This is a critical error that prevents the server from starting. ` +
      `Error details: ${errorMessage}`
    );
  }
}

/**
 * Get the Firebase app instance
 * Should only be called after initialization
 * 
 * @returns {admin.app.App} - The initialized Firebase app
 * @throws {Error} If Firebase app is not initialized
 */
function getFirebaseApp() {
  try {
    // admin.app() returns the default app if it exists
    return admin.app();
  } catch (error) {
    throw new Error(
      'Firebase app not initialized. Call initializeFirebaseAdmin() first. ' +
      'This should happen during server startup.'
    );
  }
}

/**
 * Get the Firebase Authentication service
 * @returns {admin.auth.Auth} - Firebase Auth service instance
 */
function getFirebaseAuth() {
  try {
    const app = getFirebaseApp();
    return admin.auth(app);
  } catch (error) {
    throw new Error(
      `Failed to get Firebase Auth service: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get the Firebase Realtime Database service
 * @returns {admin.database.Database} - Firebase Database service instance
 */
function getFirebaseDatabase() {
  try {
    const app = getFirebaseApp();
    return admin.database(app);
  } catch (error) {
    throw new Error(
      `Failed to get Firebase Database service: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get the Firebase Cloud Messaging service
 * @returns {admin.messaging.Messaging} - Firebase Messaging service instance
 */
function getFirebaseMessaging() {
  try {
    const app = getFirebaseApp();
    return admin.messaging(app);
  } catch (error) {
    throw new Error(
      `Failed to get Firebase Messaging service: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Check if Firebase is initialized and connected
 * @returns {boolean} - True if Firebase is ready to use
 */
function isFirebaseInitialized() {
  try {
    admin.app();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verify a Firebase ID token and extract user claims
 * This is useful for testing Firebase connectivity
 * 
 * @param {string} token - Firebase ID token to verify
 * @returns {Promise<admin.auth.DecodedIdToken>} - Decoded token claims
 * @throws {Error} If token is invalid or verification fails
 */
async function verifyIdToken(token) {
  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    throw new Error(`Firebase ID token verification failed: ${errorMessage}`);
  }
}

module.exports = {
  initializeFirebaseAdmin,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseDatabase,
  getFirebaseMessaging,
  isFirebaseInitialized,
  verifyIdToken,
  validateFirebaseCredentials,
};
