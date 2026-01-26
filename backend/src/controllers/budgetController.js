// backend/src/controllers/budgetController.js

/**
 * Budget Controller
 * 
 * Handles budget creation, tracking, and real-time updates
 */

const { db } = require('../config/firebase');
const {
  validateBudget,
  sanitizeBudget,
  validatePartialBudget
} = require('../models/budgetModel');

/**
 * Calculate budget progress based on actual expenses
 * 
 * @param {Object} budget - Budget data
 * @param {string} userId - User ID
 * @returns {Object} - Updated budget with spent amounts
 */
const calculateBudgetProgress = async (budget, userId) => {
  const { startDate, endDate } = budget.period;

  // Get all expenses in the budget period
  const expensesSnapshot = await db.collection('expenses')
    .where('userId', '==', userId)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .get();

  // Convert to array
  const expenses = [];
  expensesSnapshot.forEach(doc => {
    expenses.push(doc.data());
  });

  // Calculate spent per category
  const categorySpending = {};
  expenses.forEach(expense => {
    if (!categorySpending[expense.category]) {
      categorySpending[expense.category] = 0;
    }
    categorySpending[expense.category] += expense.amount;
  });

  // Update category budgets with actual spending
  const updatedCategoryBudgets = budget.categoryBudgets.map(catBudget => {
    const spent = categorySpending[catBudget.category] || 0;
    const remaining = catBudget.limit - spent;
    const percentage = catBudget.limit > 0 ? (spent / catBudget.limit) * 100 : 0;

    return {
      ...catBudget,
      spent: parseFloat(spent.toFixed(2)),
      remaining: parseFloat(remaining.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(2))
    };
  });

  // Calculate totals
  const totalSpent = updatedCategoryBudgets.reduce((sum, cb) => sum + cb.spent, 0);
  const totalRemaining = budget.totalLimit - totalSpent;

  // Check alerts
  const updatedAlerts = budget.alerts.map(alert => {
    const catBudget = updatedCategoryBudgets.find(cb => cb.category === alert.category);
    const shouldTrigger = catBudget && catBudget.percentage >= alert.threshold;
    
    return {
      ...alert,
      triggered: shouldTrigger,
      triggeredAt: shouldTrigger && !alert.triggered ? new Date().toISOString() : alert.triggeredAt
    };
  });

  return {
    ...budget,
    categoryBudgets: updatedCategoryBudgets,
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    totalRemaining: parseFloat(totalRemaining.toFixed(2)),
    alerts: updatedAlerts
  };
};

/**
 * CREATE: Create a new budget
 * 
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = async (req, res) => {
  try {
    // Validate input
    const validation = validateBudget(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Sanitize data
    const sanitizedData = sanitizeBudget(req.body);

    // Prepare document
    const budgetData = {
      ...sanitizedData,
      userId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Calculate initial progress
    const budgetWithProgress = await calculateBudgetProgress(budgetData, req.user.uid);

    // Save to Firestore
    const docRef = await db.collection('budgets').add(budgetWithProgress);

    res.status(201).json({
      message: 'Budget created successfully',
      budget: {
        id: docRef.id,
        ...budgetWithProgress
      }
    });

  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({
      error: 'Failed to create budget',
      message: error.message
    });
  }
};

/**
 * READ: Get all budgets for the logged-in user
 * 
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { isActive } = req.query;

    // Build query
    let query = db.collection('budgets').where('userId', '==', userId);

    // Filter by active status if provided
    if (isActive !== undefined) {
      const activeStatus = isActive === 'true';
      query = query.where('isActive', '==', activeStatus);
    }

    // Execute query
    const snapshot = await query.get();

    // Convert to array and calculate progress for each
    const budgets = [];
    for (const doc of snapshot.docs) {
      const budgetData = doc.data();
      const budgetWithProgress = await calculateBudgetProgress(budgetData, userId);
      
      budgets.push({
        id: doc.id,
        ...budgetWithProgress
      });
    }

    // Sort by start date (most recent first)
    budgets.sort((a, b) => new Date(b.period.startDate) - new Date(a.period.startDate));

    res.status(200).json({
      budgets: budgets,
      total: budgets.length
    });

  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({
      error: 'Failed to fetch budgets',
      message: error.message
    });
  }
};

/**
 * READ: Get current active budget
 * 
 * @route   GET /api/budgets/current
 * @access  Private
 */
const getCurrentBudget = async (req, res) => {
  try {
    const userId = req.user.uid;
    const today = new Date().toISOString().split('T')[0];

    // Find budget that includes today's date
    const snapshot = await db.collection('budgets')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    let currentBudget = null;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Check if today falls within the budget period
      if (data.period.startDate <= today && data.period.endDate >= today) {
        const budgetWithProgress = await calculateBudgetProgress(data, userId);
        currentBudget = {
          id: doc.id,
          ...budgetWithProgress
        };
        break;
      }
    }

    if (!currentBudget) {
      return res.status(404).json({
        error: 'No active budget found',
        message: 'No budget covers the current date'
      });
    }

    res.status(200).json({
      budget: currentBudget
    });

  } catch (error) {
    console.error('Error fetching current budget:', error);
    res.status(500).json({
      error: 'Failed to fetch current budget',
      message: error.message
    });
  }
};

/**
 * READ: Get single budget by ID
 * 
 * @route   GET /api/budgets/:id
 * @access  Private
 */
const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const docRef = db.collection('budgets').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Budget not found'
      });
    }

    const data = doc.data();

    // Check ownership
    if (data.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this budget'
      });
    }

    // Calculate current progress
    const budgetWithProgress = await calculateBudgetProgress(data, userId);

    res.status(200).json({
      budget: {
        id: doc.id,
        ...budgetWithProgress
      }
    });

  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({
      error: 'Failed to fetch budget',
      message: error.message
    });
  }
};

/**
 * READ: Get budget progress (real-time calculation)
 * 
 * @route   GET /api/budgets/:id/progress
 * @access  Private
 */
const getBudgetProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const docRef = db.collection('budgets').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Budget not found'
      });
    }

    const data = doc.data();

    // Check ownership
    if (data.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden'
      });
    }

    // Calculate progress
    const budgetWithProgress = await calculateBudgetProgress(data, userId);

    // Return only progress-related data
    res.status(200).json({
      progress: {
        categoryBudgets: budgetWithProgress.categoryBudgets,
        totalSpent: budgetWithProgress.totalSpent,
        totalRemaining: budgetWithProgress.totalRemaining,
        totalLimit: budgetWithProgress.totalLimit,
        overallPercentage: parseFloat(((budgetWithProgress.totalSpent / budgetWithProgress.totalLimit) * 100).toFixed(2)),
        alerts: budgetWithProgress.alerts.filter(alert => alert.triggered)
      }
    });

  } catch (error) {
    console.error('Error calculating budget progress:', error);
    res.status(500).json({
      error: 'Failed to calculate budget progress',
      message: error.message
    });
  }
};

/**
 * UPDATE: Update a budget
 * 
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Validate partial data
    const validation = validatePartialBudget(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Get existing document
    const docRef = db.collection('budgets').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Budget not found'
      });
    }

    const existingData = doc.data();

    // Check ownership
    if (existingData.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this budget'
      });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Recalculate totals if categoryBudgets changed
    if (req.body.categoryBudgets) {
      updateData.totalLimit = req.body.categoryBudgets.reduce((sum, cb) => sum + parseFloat(cb.limit || cb.spent || 0), 0);
    }

    // Remove fields that shouldn't be updated
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.id;
    delete updateData.totalSpent;
    delete updateData.totalRemaining;

    // Update in Firestore
    await docRef.update(updateData);

    // Get updated document and calculate progress
    const updatedDoc = await docRef.get();
    const budgetWithProgress = await calculateBudgetProgress(updatedDoc.data(), userId);

    res.status(200).json({
      message: 'Budget updated successfully',
      budget: {
        id: updatedDoc.id,
        ...budgetWithProgress
      }
    });

  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({
      error: 'Failed to update budget',
      message: error.message
    });
  }
};

/**
 * DELETE: Delete a budget
 * 
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const docRef = db.collection('budgets').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Budget not found'
      });
    }

    const data = doc.data();

    // Check ownership
    if (data.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this budget'
      });
    }

    // Delete from Firestore
    await docRef.delete();

    res.status(200).json({
      message: 'Budget deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({
      error: 'Failed to delete budget',
      message: error.message
    });
  }
};

/**
 * UPDATE: Configure budget alerts
 * 
 * @route   POST /api/budgets/:id/alerts
 * @access  Private
 */
const configureAlerts = async (req, res) => {
  try {
    const { id } = req.params;
    const { alerts } = req.body;
    const userId = req.user.uid;

    if (!Array.isArray(alerts)) {
      return res.status(400).json({
        error: 'Alerts must be an array'
      });
    }

    // Validate alert format
    for (const alert of alerts) {
      if (!alert.category || typeof alert.threshold !== 'number') {
        return res.status(400).json({
          error: 'Each alert must have category and threshold'
        });
      }
      if (alert.threshold < 0 || alert.threshold > 100) {
        return res.status(400).json({
          error: 'Alert threshold must be between 0 and 100'
        });
      }
    }

    // Get budget
    const docRef = db.collection('budgets').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Budget not found'
      });
    }

    const data = doc.data();

    // Check ownership
    if (data.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden'
      });
    }

    // Update alerts
    await docRef.update({
      alerts: alerts.map(alert => ({
        category: alert.category,
        threshold: alert.threshold,
        triggered: false,
        triggeredAt: null
      })),
      updatedAt: new Date().toISOString()
    });

    // Get updated budget with progress
    const updatedDoc = await docRef.get();
    const budgetWithProgress = await calculateBudgetProgress(updatedDoc.data(), userId);

    res.status(200).json({
      message: 'Alerts configured successfully',
      budget: {
        id: updatedDoc.id,
        ...budgetWithProgress
      }
    });

  } catch (error) {
    console.error('Error configuring alerts:', error);
    res.status(500).json({
      error: 'Failed to configure alerts',
      message: error.message
    });
  }
};

/**
 * Helper function to update budget progress when expenses change
 * This should be called after creating/updating/deleting expenses
 * 
 * @param {string} userId - User ID
 * @param {string} expenseDate - Date of the expense
 */
const updateAffectedBudgets = async (userId, expenseDate) => {
  try {
    // Find budgets that include this date
    const snapshot = await db.collection('budgets')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    const batch = db.batch();
    let updatedCount = 0;

    for (const doc of snapshot.docs) {
      const budgetData = doc.data();
      
      // Check if expense date falls within budget period
      if (budgetData.period.startDate <= expenseDate && budgetData.period.endDate >= expenseDate) {
        const budgetWithProgress = await calculateBudgetProgress(budgetData, userId);
        
        batch.update(doc.ref, {
          categoryBudgets: budgetWithProgress.categoryBudgets,
          totalSpent: budgetWithProgress.totalSpent,
          totalRemaining: budgetWithProgress.totalRemaining,
          alerts: budgetWithProgress.alerts,
          updatedAt: new Date().toISOString()
        });
        
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Updated ${updatedCount} affected budgets`);
    }

  } catch (error) {
    console.error('Error updating affected budgets:', error);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getCurrentBudget,
  getBudgetById,
  getBudgetProgress,
  updateBudget,
  deleteBudget,
  configureAlerts,
  updateAffectedBudgets,
  calculateBudgetProgress
};