// backend/src/middleware/auth.js

/**
 * Authentication Middleware
 * 
 * This middleware runs BEFORE protected routes
 * It verifies the user's Firebase token and extracts their user ID
 */

const { auth } = require('../config/firebase');

/**
 * Verify Firebase ID Token
 * 
 * How it works:
 * 1. Extract token from Authorization header
 * 2. Verify token with Firebase Admin SDK
 * 3. Attach user info to request object
 * 4. Pass control to next middleware/route
 */
const verifyToken = async (req, res, next) => {
  try {
    // Step 1: Get the Authorization header
    // Format: "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6..."
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        error: 'No authorization header provided',
        message: 'Please include Authorization header with your request'
      });
    }

    // Check if it starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Invalid authorization format',
        message: 'Authorization header must start with "Bearer "'
      });
    }

    // Step 2: Extract the token (remove "Bearer " prefix)
    // "Bearer TOKEN" → "TOKEN"
    const token = authHeader.split('Bearer ')[1];

    // Check if token exists after "Bearer "
    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Token is missing from Authorization header'
      });
    }

    // Step 3: Verify the token with Firebase
    // This checks:
    // - Is the signature valid? (not tampered with)
    // - Is it expired?
    // - Was it issued by our Firebase project?
    const decodedToken = await auth.verifyIdToken(token);

    // Step 4: Attach user information to the request object
    // Now any route handler can access req.user
    req.user = {
      uid: decodedToken.uid,           // Firebase user ID
      email: decodedToken.email,       // User's email
      emailVerified: decodedToken.email_verified,
      // Add any other fields you need from the token
    };

    // Log for debugging (remove in production)
    console.log('✅ Authenticated user:', req.user.email);

    // Step 5: Pass control to the next middleware or route handler
    next();

  } catch (error) {
    // Handle different types of errors
    console.error('❌ Authentication error:', error.message);

    // Token expired
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.'
      });
    }

    // Token revoked (user changed password, etc.)
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Token revoked',
        message: 'Your session has been revoked. Please log in again.'
      });
    }

    // Invalid token (malformed, wrong signature, etc.)
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed. Please log in again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Optional Middleware: Check if user is authenticated
 * Use this for routes that work with OR without authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
      };
    }
    // If no token, req.user remains undefined (but we don't throw error)
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    // Route handler can check if req.user exists
    next();
  }
};

// Export both middleware functions
module.exports = {
  verifyToken,
  optionalAuth
};