// backend/src/models/budgetModel.js

/**
 * Budget Data Validation
 * 
 * Validates budget data for monthly/category budgets
 */

/**
 * Validate budget data
 * 
 * @param {Object} data - Budget data
 * @returns {Object} - { isValid: boolean, errors: array }
 */
const validateBudget = (data) => {
  const errors = [];

  // 1. Validate name
  if (!data.name) {
    errors.push('Budget name is required');
  } else if (typeof data.name !== 'string') {
    errors.push('Budget name must be a string');
  } else if (data.name.trim().length === 0) {
    errors.push('Budget name cannot be empty');
  } else if (data.name.length > 100) {
    errors.push('Budget name must be less than 100 characters');
  }

  // 2. Validate type
  const validTypes = ['monthly', 'weekly', 'custom'];
  if (!data.type) {
    errors.push('Budget type is required');
  } else if (!validTypes.includes(data.type)) {
    errors.push(`Budget type must be one of: ${validTypes.join(', ')}`);
  }

  // 3. Validate period
  if (!data.period) {
    errors.push('Period is required');
  } else {
    if (!data.period.startDate) {
      errors.push('Period start date is required');
    } else {
      const startDate = new Date(data.period.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push('Period start date must be a valid ISO date');
      }
    }

    if (!data.period.endDate) {
      errors.push('Period end date is required');
    } else {
      const endDate = new Date(data.period.endDate);
      if (isNaN(endDate.getTime())) {
        errors.push('Period end date must be a valid ISO date');
      }
      
      // Check if end date is after start date
      if (data.period.startDate && new Date(data.period.endDate) <= new Date(data.period.startDate)) {
        errors.push('Period end date must be after start date');
      }
    }
  }

  // 4. Validate categoryBudgets
  if (!data.categoryBudgets || !Array.isArray(data.categoryBudgets)) {
    errors.push('Category budgets must be an array');
  } else if (data.categoryBudgets.length === 0) {
    errors.push('At least one category budget is required');
  } else {
    data.categoryBudgets.forEach((catBudget, index) => {
      if (!catBudget.category) {
        errors.push(`Category budget ${index + 1}: category is required`);
      }
      
      if (catBudget.limit === undefined || catBudget.limit === null) {
        errors.push(`Category budget ${index + 1}: limit is required`);
      } else if (typeof catBudget.limit !== 'number') {
        errors.push(`Category budget ${index + 1}: limit must be a number`);
      } else if (catBudget.limit < 0) {
        errors.push(`Category budget ${index + 1}: limit cannot be negative`);
      } else if (catBudget.limit > 1000000) {
        errors.push(`Category budget ${index + 1}: limit cannot exceed 1,000,000`);
      }
    });
  }

  // 5. Validate alerts (optional)
  if (data.alerts && Array.isArray(data.alerts)) {
    data.alerts.forEach((alert, index) => {
      if (!alert.category) {
        errors.push(`Alert ${index + 1}: category is required`);
      }
      
      if (alert.threshold === undefined || alert.threshold === null) {
        errors.push(`Alert ${index + 1}: threshold is required`);
      } else if (typeof alert.threshold !== 'number') {
        errors.push(`Alert ${index + 1}: threshold must be a number`);
      } else if (alert.threshold < 0 || alert.threshold > 100) {
        errors.push(`Alert ${index + 1}: threshold must be between 0 and 100`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Sanitize budget data
 * 
 * @param {Object} data - Raw budget data
 * @returns {Object} - Sanitized data
 */
const sanitizeBudget = (data) => {
  return {
    name: data.name.trim(),
    type: data.type,
    period: {
      startDate: data.period.startDate,
      endDate: data.period.endDate
    },
    categoryBudgets: data.categoryBudgets.map(cb => ({
      category: cb.category.trim(),
      limit: parseFloat(cb.limit),
      spent: 0,
      remaining: parseFloat(cb.limit),
      percentage: 0
    })),
    totalLimit: data.categoryBudgets.reduce((sum, cb) => sum + parseFloat(cb.limit), 0),
    totalSpent: 0,
    totalRemaining: data.categoryBudgets.reduce((sum, cb) => sum + parseFloat(cb.limit), 0),
    alerts: data.alerts ? data.alerts.map(alert => ({
      category: alert.category.trim(),
      threshold: parseFloat(alert.threshold),
      triggered: false,
      triggeredAt: null
    })) : [],
    isActive: data.isActive !== undefined ? data.isActive : true
  };
};

/**
 * Validate partial budget data (for updates)
 * 
 * @param {Object} data - Partial budget data
 * @returns {Object} - { isValid: boolean, errors: array }
 */
const validatePartialBudget = (data) => {
  const errors = [];

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Budget name must be a non-empty string');
    } else if (data.name.length > 100) {
      errors.push('Budget name must be less than 100 characters');
    }
  }

  if (data.type !== undefined) {
    const validTypes = ['monthly', 'weekly', 'custom'];
    if (!validTypes.includes(data.type)) {
      errors.push(`Budget type must be one of: ${validTypes.join(', ')}`);
    }
  }

  if (data.categoryBudgets !== undefined) {
    if (!Array.isArray(data.categoryBudgets) || data.categoryBudgets.length === 0) {
      errors.push('Category budgets must be a non-empty array');
    } else {
      data.categoryBudgets.forEach((catBudget, index) => {
        if (!catBudget.category || typeof catBudget.category !== 'string') {
          errors.push(`Category budget ${index + 1}: category is required`);
        }
        
        if (catBudget.limit !== undefined) {
          if (typeof catBudget.limit !== 'number' || catBudget.limit < 0) {
            errors.push(`Category budget ${index + 1}: limit must be a positive number`);
          }
        }
      });
    }
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

module.exports = {
  validateBudget,
  sanitizeBudget,
  validatePartialBudget
};