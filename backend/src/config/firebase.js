// backend/src/config/firebase.js

// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Load environment variables
require('dotenv').config();

/**
 * Initialize Firebase Admin SDK
 * 
 * Why Admin SDK instead of regular Firebase SDK?
 * - Admin SDK has full database access (no security rules)
 * - Used on backend where we trust the environment
 * - Can verify user tokens from frontend
 */

// Check if Firebase is already initialized (prevents errors on hot reload)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Private key has \n characters that need to be converted to actual line breaks
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// Get Firestore database instance
const db = admin.firestore();

// Get Firebase Auth instance (for verifying tokens)
const auth = admin.auth();

// Export for use in other files
module.exports = { admin, db, auth };