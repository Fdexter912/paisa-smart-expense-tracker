// backend/src/controllers/expenseController.js

/**
 * Expense Controller
 * 
 * Contains all business logic for expense operations
 * Separated from routes for better organization and testing
 */

const { db } = require('../config/firebase');
const { validateExpense, sanitizeExpense, validatePartialExpense } = require('../models/expenseModel');

/**
 * CREATE: Add a new expense
 * 
 * @route   POST /api/expenses
 * @access  Private (requires authentication)
 */
const createExpense = async (req, res) => {
  try {
    // Step 1: Validate input data
    const validation = validateExpense(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Step 2: Sanitize data (trim, parse, etc.)
    const sanitizedData = sanitizeExpense(req.body);

    // Step 3: Add server-side fields
    const expenseData = {
      ...sanitizedData,
      userId: req.user.uid,  // From auth middleware
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Step 4: Save to Firestore
    // addDoc generates a unique ID automatically
    const docRef = await db.collection('expenses').add(expenseData);

    // Step 5: Return created expense with ID
    res.status(201).json({
      message: 'Expense created successfully',
      expense: {
        id: docRef.id,
        ...expenseData
      }
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      error: 'Failed to create expense',
      message: error.message
    });
  }
};

/**
 * READ: Get all expenses for the logged-in user
 * 
 * @route   GET /api/expenses
 * @access  Private
 * @query   ?page=1&limit=10&category=Food&startDate=2026-01-01&endDate=2026-01-31
 */
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Extract query parameters
    const {
      page = 1,
      limit = 50,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc'
    } = req.query;

    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Validate pagination
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Invalid pagination parameters',
        message: 'Page must be >= 1, limit must be between 1 and 100'
      });
    }

    // Step 1: Build base query - ONLY userId filter
    let query = db.collection('expenses').where('userId', '==', userId);

    // Step 2: Execute query and get all user's expenses
    const snapshot = await query.get();

    // Step 3: Convert to array
    let allExpenses = [];
    snapshot.forEach(doc => {
      allExpenses.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Step 4: Apply filters in JavaScript (instead of Firestore query)
    if (category) {
      allExpenses = allExpenses.filter(exp => exp.category === category);
    }

    if (startDate) {
      allExpenses = allExpenses.filter(exp => exp.date >= startDate);
    }

    if (endDate) {
      allExpenses = allExpenses.filter(exp => exp.date <= endDate);
    }

    // Step 5: Sort in JavaScript
    const sortField = sortBy === 'amount' ? 'amount' : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;
    
    allExpenses.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });

    // Step 6: Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedExpenses = allExpenses.slice(startIndex, endIndex);

    // Step 7: Calculate totals
    const total = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Step 8: Return response
    res.status(200).json({
      expenses: paginatedExpenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: allExpenses.length,
        totalPages: Math.ceil(allExpenses.length / limitNum)
      },
      summary: {
        totalExpenses: allExpenses.length,
        totalAmount: parseFloat(total.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      error: 'Failed to fetch expenses',
      message: error.message
    });
  }
};

/**
 * READ: Get a single expense by ID
 * 
 * @route   GET /api/expenses/:id
 * @access  Private
 */
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Step 1: Get document from Firestore
    const docRef = db.collection('expenses').doc(id);
    const doc = await docRef.get();

    // Step 2: Check if exists
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Expense not found',
        message: `No expense found with ID: ${id}`
      });
    }

    // Step 3: Check ownership
    const expenseData = doc.data();
    if (expenseData.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this expense'
      });
    }

    // Step 4: Return expense
    res.status(200).json({
      expense: {
        id: doc.id,
        ...expenseData
      }
    });

  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      error: 'Failed to fetch expense',
      message: error.message
    });
  }
};

/**
 * UPDATE: Update an existing expense
 * 
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Step 1: Validate partial data (only fields being updated)
    const validation = validatePartialExpense(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Step 2: Get existing expense
    const docRef = db.collection('expenses').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Expense not found',
        message: `No expense found with ID: ${id}`
      });
    }

    // Step 3: Check ownership
    const existingData = doc.data();
    if (existingData.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this expense'
      });
    }

    // Step 4: Prepare update data
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Remove fields that shouldn't be updated
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.id;

    // Step 5: Update in Firestore
    await docRef.update(updateData);

    // Step 6: Get updated document
    const updatedDoc = await docRef.get();

    res.status(200).json({
      message: 'Expense updated successfully',
      expense: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });

  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      error: 'Failed to update expense',
      message: error.message
    });
  }
};

/**
 * DELETE: Delete an expense
 * 
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Step 1: Get expense
    const docRef = db.collection('expenses').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Expense not found',
        message: `No expense found with ID: ${id}`
      });
    }

    // Step 2: Check ownership
    const expenseData = doc.data();
    if (expenseData.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this expense'
      });
    }

    // Step 3: Delete from Firestore
    await docRef.delete();

    res.status(200).json({
      message: 'Expense deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      error: 'Failed to delete expense',
      message: error.message
    });
  }
};

/**
 * ANALYTICS: Get expense statistics
 * 
 * @route   GET /api/expenses/stats/summary
 * @access  Private
 */
const getExpenseStats = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { startDate, endDate } = req.query;

    // Build query
    let query = db.collection('expenses').where('userId', '==', userId);

    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    // Get all expenses
    const snapshot = await query.get();
    
    const expenses = [];
    snapshot.forEach(doc => {
      expenses.push(doc.data());
    });

    // Calculate statistics
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Group by category
    const categoryBreakdown = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = {
          count: 0,
          total: 0
        };
      }
      acc[exp.category].count += 1;
      acc[exp.category].total += exp.amount;
      return acc;
    }, {});

    // Average per expense
    const averageExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    res.status(200).json({
      summary: {
        totalExpenses,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        averageExpense: parseFloat(averageExpense.toFixed(2)),
        dateRange: {
          start: startDate || 'all time',
          end: endDate || 'present'
        }
      },
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        count: data.count,
        total: parseFloat(data.total.toFixed(2)),
        percentage: parseFloat(((data.total / totalAmount) * 100).toFixed(2))
      }))
    });

  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({
      error: 'Failed to calculate statistics',
      message: error.message
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats
};