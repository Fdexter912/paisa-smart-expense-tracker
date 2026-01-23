// backend/src/routes/ai.js

/**
 * AI Routes
 * 
 * Endpoints for AI-powered features
 */

const express = require('express');
const router = express.Router();

const {
  getCategorySuggestion,
  getCategories,
  updateCategories
} = require('../controllers/aiController');

const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   POST /api/ai/suggest-category
 * @desc    Get AI category suggestion for expense description
 * @access  Private
 * @body    { description, amount? }
 */
router.post('/suggest-category', getCategorySuggestion);

/**
 * @route   GET /api/ai/categories
 * @desc    Get user's categories
 * @access  Private
 */
router.get('/categories', getCategories);

/**
 * @route   PUT /api/ai/categories
 * @desc    Update user's custom categories
 * @access  Private
 * @body    { categories: [] }
 */
router.put('/categories', updateCategories);

module.exports = router;