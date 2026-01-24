// backend/src/controllers/recurringExpenseController.js

/**
 * Recurring Expense Controller
 * 
 * Handles all recurring expense operations
 */

const { db } = require('../config/firebase');
const {
  validateRecurringExpense,
  sanitizeRecurringExpense,
  validatePartialRecurringExpense
} = require('../models/recurringExpenseModel');

/**
 * Calculate next occurrence date based on frequency
 * 
 * @param {string} currentDate - Current date (YYYY-MM-DD)
 * @param {string} frequency - Frequency type
 * @returns {string} - Next occurrence date (YYYY-MM-DD)
 */
const calculateNextOccurrence = (currentDate, frequency) => {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error('Invalid frequency');
  }
  
  return date.toISOString().split('T')[0];
};

/**
 * CREATE: Add a new recurring expense
 * 
 * @route   POST /api/recurring-expenses
 * @access  Private
 */
const createRecurringExpense = async (req, res) => {
  try {
    // Validate input
    const validation = validateRecurringExpense(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Sanitize data
    const sanitizedData = sanitizeRecurringExpense(req.body);

    // Calculate next occurrence
    const nextOccurrence = calculateNextOccurrence(sanitizedData.startDate, sanitizedData.frequency);

    // Prepare document
    const recurringExpenseData = {
      ...sanitizedData,
      userId: req.user.uid,
      nextOccurrence: nextOccurrence,
      lastGenerated: null, // No expenses generated yet
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore
    const docRef = await db.collection('recurring_expenses').add(recurringExpenseData);

    res.status(201).json({
      message: 'Recurring expense created successfully',
      recurringExpense: {
        id: docRef.id,
        ...recurringExpenseData
      }
    });

  } catch (error) {
    console.error('Error creating recurring expense:', error);
    res.status(500).json({
      error: 'Failed to create recurring expense',
      message: error.message
    });
  }
};

/**
 * READ: Get all recurring expenses for the logged-in user
 * 
 * @route   GET /api/recurring-expenses
 * @access  Private
 */
const getRecurringExpenses = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { isActive } = req.query;

    // Build query
    let query = db.collection('recurring_expenses').where('userId', '==', userId);

    // Filter by active status if provided
    if (isActive !== undefined) {
      const activeStatus = isActive === 'true';
      query = query.where('isActive', '==', activeStatus);
    }

    // Execute query
    const snapshot = await query.get();

    // Convert to array
    const recurringExpenses = [];
    snapshot.forEach(doc => {
      recurringExpenses.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by next occurrence
    recurringExpenses.sort((a, b) => {
      return new Date(a.nextOccurrence) - new Date(b.nextOccurrence);
    });

    // Calculate totals
    const totalMonthly = recurringExpenses
      .filter(re => re.isActive)
      .reduce((sum, re) => {
        // Convert to monthly cost
        let monthlyCost = 0;
        switch (re.frequency) {
          case 'daily':
            monthlyCost = re.amount * 30;
            break;
          case 'weekly':
            monthlyCost = re.amount * 4;
            break;
          case 'biweekly':
            monthlyCost = re.amount * 2;
            break;
          case 'monthly':
            monthlyCost = re.amount;
            break;
          case 'yearly':
            monthlyCost = re.amount / 12;
            break;
        }
        return sum + monthlyCost;
      }, 0);

    res.status(200).json({
      recurringExpenses: recurringExpenses,
      summary: {
        total: recurringExpenses.length,
        active: recurringExpenses.filter(re => re.isActive).length,
        inactive: recurringExpenses.filter(re => !re.isActive).length,
        estimatedMonthlyTotal: parseFloat(totalMonthly.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    res.status(500).json({
      error: 'Failed to fetch recurring expenses',
      message: error.message
    });
  }
};

/**
 * READ: Get upcoming recurring expenses (next 30 days)
 * 
 * @route   GET /api/recurring-expenses/upcoming
 * @access  Private
 */
const getUpcomingRecurringExpenses = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { days = 30 } = req.query;

    // Calculate date range
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));
    const futureDateStr = futureDate.toISOString().split('T')[0];

    // Get all active recurring expenses
    const snapshot = await db.collection('recurring_expenses')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    const upcoming = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Check if next occurrence is within the range
      if (data.nextOccurrence >= today && data.nextOccurrence <= futureDateStr) {
        upcoming.push({
          id: doc.id,
          ...data,
          daysUntil: Math.ceil((new Date(data.nextOccurrence) - new Date(today)) / (1000 * 60 * 60 * 24))
        });
      }
    });

    // Sort by next occurrence
    upcoming.sort((a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence));

    res.status(200).json({
      upcoming: upcoming,
      count: upcoming.length,
      dateRange: {
        start: today,
        end: futureDateStr
      }
    });

  } catch (error) {
    console.error('Error fetching upcoming expenses:', error);
    res.status(500).json({
      error: 'Failed to fetch upcoming expenses',
      message: error.message
    });
  }
};

/**
 * READ: Get single recurring expense by ID
 * 
 * @route   GET /api/recurring-expenses/:id
 * @access  Private
 */
const getRecurringExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const docRef = db.collection('recurring_expenses').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Recurring expense not found'
      });
    }

    const data = doc.data();

    // Check ownership
    if (data.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this recurring expense'
      });
    }

    res.status(200).json({
      recurringExpense: {
        id: doc.id,
        ...data
      }
    });

  } catch (error) {
    console.error('Error fetching recurring expense:', error);
    res.status(500).json({
      error: 'Failed to fetch recurring expense',
      message: error.message
    });
  }
};

/**
 * UPDATE: Update a recurring expense
 * 
 * @route   PUT /api/recurring-expenses/:id
 * @access  Private
 */
const updateRecurringExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Validate partial data
    const validation = validatePartialRecurringExpense(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Get existing document
    const docRef = db.collection('recurring_expenses').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Recurring expense not found'
      });
    }

    const existingData = doc.data();

    // Check ownership
    if (existingData.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this recurring expense'
      });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Recalculate next occurrence if frequency or start date changed
    if (req.body.frequency || req.body.startDate) {
      const newFrequency = req.body.frequency || existingData.frequency;
      const baseDate = existingData.lastGenerated || existingData.startDate;
      updateData.nextOccurrence = calculateNextOccurrence(baseDate, newFrequency);
    }

    // Remove fields that shouldn't be updated
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.id;
    delete updateData.lastGenerated;

    // Update in Firestore
    await docRef.update(updateData);

    // Get updated document
    const updatedDoc = await docRef.get();

    res.status(200).json({
      message: 'Recurring expense updated successfully',
      recurringExpense: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });

  } catch (error) {
    console.error('Error updating recurring expense:', error);
    res.status(500).json({
      error: 'Failed to update recurring expense',
      message: error.message
    });
  }
};

/**
 * DELETE: Delete a recurring expense
 * 
 * @route   DELETE /api/recurring-expenses/:id
 * @access  Private
 */
const deleteRecurringExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const docRef = db.collection('recurring_expenses').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Recurring expense not found'
      });
    }

    const data = doc.data();

    // Check ownership
    if (data.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this recurring expense'
      });
    }

    // Delete from Firestore
    await docRef.delete();

    res.status(200).json({
      message: 'Recurring expense deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    res.status(500).json({
      error: 'Failed to delete recurring expense',
      message: error.message
    });
  }
};

/**
 * GENERATE: Manually generate an expense from recurring template
 * 
 * @route   POST /api/recurring-expenses/:id/generate
 * @access  Private
 */
const generateExpenseFromRecurring = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Get recurring expense
    const recurringDocRef = db.collection('recurring_expenses').doc(id);
    const recurringDoc = await recurringDocRef.get();

    if (!recurringDoc.exists) {
      return res.status(404).json({
        error: 'Recurring expense not found'
      });
    }

    const recurringData = recurringDoc.data();

    // Check ownership
    if (recurringData.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden'
      });
    }

    // Create actual expense
    const expenseData = {
      userId: userId,
      amount: recurringData.amount,
      category: recurringData.category,
      description: recurringData.description,
      date: recurringData.nextOccurrence,
      aiSuggested: false,
      recurringExpenseId: id, // Link to recurring template
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const expenseRef = await db.collection('expenses').add(expenseData);

    // Update recurring expense
    const nextOccurrence = calculateNextOccurrence(recurringData.nextOccurrence, recurringData.frequency);
    
    await recurringDocRef.update({
      lastGenerated: recurringData.nextOccurrence,
      nextOccurrence: nextOccurrence,
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Expense generated from recurring template',
      expense: {
        id: expenseRef.id,
        ...expenseData
      },
      nextOccurrence: nextOccurrence
    });

  } catch (error) {
    console.error('Error generating expense:', error);
    res.status(500).json({
      error: 'Failed to generate expense',
      message: error.message
    });
  }
};

/**
 * CRON JOB: Auto-generate expenses from recurring templates
 * This function is called by a scheduled job
 */
const generateDueExpenses = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`[CRON] Checking for recurring expenses due on ${today}...`);

    // Get all active recurring expenses due today
    const snapshot = await db.collection('recurring_expenses')
      .where('isActive', '==', true)
      .where('autoGenerate', '==', true)
      .where('nextOccurrence', '<=', today)
      .get();

    let generated = 0;
    const batch = db.batch();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Check if end date has passed
      if (data.endDate && data.endDate < today) {
        // Deactivate this recurring expense
        batch.update(doc.ref, { isActive: false });
        continue;
      }

      // Create expense
      const expenseRef = db.collection('expenses').doc();
      batch.set(expenseRef, {
        userId: data.userId,
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: data.nextOccurrence,
        aiSuggested: false,
        recurringExpenseId: doc.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update recurring expense
      const nextOccurrence = calculateNextOccurrence(data.nextOccurrence, data.frequency);
      batch.update(doc.ref, {
        lastGenerated: data.nextOccurrence,
        nextOccurrence: nextOccurrence,
        updatedAt: new Date().toISOString()
      });

      generated++;
    }

    // Commit all changes
    await batch.commit();

    console.log(`[CRON] Generated ${generated} expenses from recurring templates`);
    return { success: true, generated };

  } catch (error) {
    console.error('[CRON] Error generating recurring expenses:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createRecurringExpense,
  getRecurringExpenses,
  getUpcomingRecurringExpenses,
  getRecurringExpenseById,
  updateRecurringExpense,
  deleteRecurringExpense,
  generateExpenseFromRecurring,
  generateDueExpenses
};