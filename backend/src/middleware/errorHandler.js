// backend/src/middleware/errorHandler.js

/**
 * Centralized Error Handling Middleware
 * 
 * This catches all errors from route handlers and formats them consistently
 * Must be the LAST middleware in server.js
 */

/**
 * Error handler middleware
 * 
 * @param {Error} err - The error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware (not used but required)
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('═══════════════════════════════════════');
  console.error('ERROR:', err.message);
  console.error('PATH:', req.method, req.path);
  console.error('TIME:', new Date().toISOString());
  
  if (process.env.NODE_ENV === 'development') {
    console.error('STACK:', err.stack);
  }
  console.error('═══════════════════════════════════════');

  // Determine status code
  // err.status or err.statusCode might be set by other middleware
  const statusCode = err.status || err.statusCode || 500;

  // Build error response
  const errorResponse = {
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
    }
  };

  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Add custom error details if they exist
  if (err.details) {
    errorResponse.error.details = err.details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Not Found Handler
 * 
 * This runs when no route matches the request
 * Should be placed BEFORE the error handler in server.js
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found - ${req.method} ${req.originalUrl}`);
  error.status = 404;
  
  res.status(404).json({
    error: {
      message: error.message,
      status: 404,
      path: req.originalUrl,
      method: req.method
    }
  });
};

/**
 * Async Error Wrapper
 * 
 * Wraps async route handlers to catch errors automatically
 * Without this, you need try-catch in every async route
 * 
 * Usage:
 * app.get('/route', asyncHandler(async (req, res) => {
 *   const data = await someAsyncFunction();
 *   res.json(data);
 * }));
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};