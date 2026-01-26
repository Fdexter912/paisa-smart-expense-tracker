// backend/src/routes/budgets.js

/**
 * Budget Routes
 */

const express = require('express');
const router = express.Router();

const {
  createBudget,
  getBudgets,
  getCurrentBudget,
  getBudgetById,
  getBudgetProgress,
  updateBudget,
  deleteBudget,
  configureAlerts
} = require('../controllers/budgetController');

const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   POST /api/budgets
 * @desc    Create a new budget
 * @access  Private
 */
router.post('/', createBudget);

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets
 * @access  Private
 * @query   ?isActive=true|false
 */
router.get('/', getBudgets);

/**
 * @route   GET /api/budgets/current
 * @desc    Get current active budget
 * @access  Private
 */
router.get('/current', getCurrentBudget);

/**
 * @route   GET /api/budgets/:id
 * @desc    Get single budget
 * @access  Private
 */
router.get('/:id', getBudgetById);

/**
 * @route   GET /api/budgets/:id/progress
 * @desc    Get budget progress (real-time)
 * @access  Private
 */
router.get('/:id/progress', getBudgetProgress);

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update budget
 * @access  Private
 */
router.put('/:id', updateBudget);

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete budget
 * @access  Private
 */
router.delete('/:id', deleteBudget);

/**
 * @route   POST /api/budgets/:id/alerts
 * @desc    Configure budget alerts
 * @access  Private
 */
router.post('/:id/alerts', configureAlerts);

module.exports = router;