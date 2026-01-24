// backend/src/routes/recurringExpenses.js

/**
 * Recurring Expense Routes
 */

const express = require('express');
const router = express.Router();

const {
  createRecurringExpense,
  getRecurringExpenses,
  getUpcomingRecurringExpenses,
  getRecurringExpenseById,
  updateRecurringExpense,
  deleteRecurringExpense,
  generateExpenseFromRecurring
} = require('../controllers/recurringExpenseController');

const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   POST /api/recurring-expenses
 * @desc    Create a new recurring expense
 * @access  Private
 */
router.post('/', createRecurringExpense);

/**
 * @route   GET /api/recurring-expenses
 * @desc    Get all recurring expenses
 * @access  Private
 * @query   ?isActive=true|false
 */
router.get('/', getRecurringExpenses);

/**
 * @route   GET /api/recurring-expenses/upcoming
 * @desc    Get upcoming recurring expenses
 * @access  Private
 * @query   ?days=30
 */
router.get('/upcoming', getUpcomingRecurringExpenses);

/**
 * @route   GET /api/recurring-expenses/:id
 * @desc    Get single recurring expense
 * @access  Private
 */
router.get('/:id', getRecurringExpenseById);

/**
 * @route   PUT /api/recurring-expenses/:id
 * @desc    Update recurring expense
 * @access  Private
 */
router.put('/:id', updateRecurringExpense);

/**
 * @route   DELETE /api/recurring-expenses/:id
 * @desc    Delete recurring expense
 * @access  Private
 */
router.delete('/:id', deleteRecurringExpense);

/**
 * @route   POST /api/recurring-expenses/:id/generate
 * @desc    Manually generate expense from template
 * @access  Private
 */
router.post('/:id/generate', generateExpenseFromRecurring);

module.exports = router;