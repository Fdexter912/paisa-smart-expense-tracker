// backend/src/routes/expenses.js

/**
 * Expense Routes
 * 
 * Defines all expense-related endpoints
 * Uses controllers for business logic
 */

const express = require('express');
const router = express.Router();

const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats
} = require('../controllers/expenseController');

const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Private
 * @body    { amount, category, description, date, aiSuggested? }
 */
router.post('/', createExpense);

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses for logged-in user
 * @access  Private
 * @query   ?page=1&limit=10&category=Food&startDate=2026-01-01&endDate=2026-01-31
 */
router.get('/', getExpenses);

/**
 * @route   GET /api/expenses/stats/summary
 * @desc    Get expense statistics
 * @access  Private
 * @query   ?startDate=2026-01-01&endDate=2026-01-31
 */
router.get('/stats/summary', getExpenseStats);

/**
 * @route   GET /api/expenses/:id
 * @desc    Get single expense by ID
 * @access  Private
 */
router.get('/:id', getExpenseById);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an expense
 * @access  Private
 * @body    { amount?, category?, description?, date?, aiSuggested? }
 */
router.put('/:id', updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense
 * @access  Private
 */
router.delete('/:id', deleteExpense);

module.exports = router;