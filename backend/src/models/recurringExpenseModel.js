// backend/src/models/recurringExpenseModel.js

/**
 * Recurring Expense Data Validation
 * 
 * Validates data for recurring expenses (subscriptions, bills, etc.)
 */

/**
 * Validate recurring expense data
 * 
 * @param {Object} data - Recurring expense data
 * @returns {Object} - { isValid: boolean, errors: array }
 */
const validateRecurringExpense = (data) => {
  const errors = [];

  // 1. Validate template name
  if (!data.templateName) {
    errors.push('Template name is required');
  } else if (typeof data.templateName !== 'string') {
    errors.push('Template name must be a string');
  } else if (data.templateName.trim().length === 0) {
    errors.push('Template name cannot be empty');
  } else if (data.templateName.length > 100) {
    errors.push('Template name must be less than 100 characters');
  }

  // 2. Validate amount
  if (!data.amount && data.amount !== 0) {
    errors.push('Amount is required');
  } else if (typeof data.amount !== 'number') {
    errors.push('Amount must be a number');
  } else if (data.amount < 0) {
    errors.push('Amount cannot be negative');
  } else if (data.amount > 1000000) {
    errors.push('Amount cannot exceed 1,000,000');
  }

  // 3. Validate category
  if (!data.category) {
    errors.push('Category is required');
  } else if (typeof data.category !== 'string') {
    errors.push('Category must be a string');
  } else if (data.category.trim().length === 0) {
    errors.push('Category cannot be empty');
  }

  // 4. Validate description
  if (!data.description) {
    errors.push('Description is required');
  } else if (typeof data.description !== 'string') {
    errors.push('Description must be a string');
  } else if (data.description.trim().length === 0) {
    errors.push('Description cannot be empty');
  } else if (data.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  // 5. Validate frequency
  const validFrequencies = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'];
  if (!data.frequency) {
    errors.push('Frequency is required');
  } else if (!validFrequencies.includes(data.frequency)) {
    errors.push(`Frequency must be one of: ${validFrequencies.join(', ')}`);
  }

  // 6. Validate start date
  if (!data.startDate) {
    errors.push('Start date is required');
  } else if (typeof data.startDate !== 'string') {
    errors.push('Start date must be a string');
  } else {
    const dateObj = new Date(data.startDate);
    if (isNaN(dateObj.getTime())) {
      errors.push('Start date must be a valid ISO date string (YYYY-MM-DD)');
    }
  }

  // 7. Validate end date (optional)
  if (data.endDate !== undefined && data.endDate !== null) {
    if (typeof data.endDate !== 'string') {
      errors.push('End date must be a string');
    } else {
      const dateObj = new Date(data.endDate);
      if (isNaN(dateObj.getTime())) {
        errors.push('End date must be a valid ISO date string (YYYY-MM-DD)');
      }
      
      // Check if end date is after start date
      if (data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
        errors.push('End date must be after start date');
      }
    }
  }

  // 8. Validate autoGenerate (optional, default to true)
  if (data.autoGenerate !== undefined && typeof data.autoGenerate !== 'boolean') {
    errors.push('autoGenerate must be a boolean');
  }

  // 9. Validate reminderDays (optional)
  if (data.reminderDays !== undefined) {
    if (typeof data.reminderDays !== 'number') {
      errors.push('reminderDays must be a number');
    } else if (data.reminderDays < 0 || data.reminderDays > 30) {
      errors.push('reminderDays must be between 0 and 30');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Sanitize recurring expense data
 * 
 * @param {Object} data - Raw recurring expense data
 * @returns {Object} - Sanitized data
 */
const sanitizeRecurringExpense = (data) => {
  return {
    templateName: data.templateName.trim(),
    amount: parseFloat(data.amount),
    category: data.category.trim(),
    description: data.description.trim(),
    frequency: data.frequency,
    startDate: data.startDate,
    endDate: data.endDate || null,
    autoGenerate: data.autoGenerate !== undefined ? data.autoGenerate : true,
    reminderDays: data.reminderDays || 0,
    isActive: data.isActive !== undefined ? data.isActive : true
  };
};

/**
 * Validate partial recurring expense data (for updates)
 * 
 * @param {Object} data - Partial recurring expense data
 * @returns {Object} - { isValid: boolean, errors: array }
 */
const validatePartialRecurringExpense = (data) => {
  const errors = [];

  // Only validate fields that are present
  if (data.templateName !== undefined) {
    if (typeof data.templateName !== 'string' || data.templateName.trim().length === 0) {
      errors.push('Template name must be a non-empty string');
    } else if (data.templateName.length > 100) {
      errors.push('Template name must be less than 100 characters');
    }
  }

  if (data.amount !== undefined) {
    if (typeof data.amount !== 'number' || data.amount < 0) {
      errors.push('Amount must be a positive number');
    } else if (data.amount > 1000000) {
      errors.push('Amount cannot exceed 1,000,000');
    }
  }

  if (data.category !== undefined) {
    if (typeof data.category !== 'string' || data.category.trim().length === 0) {
      errors.push('Category must be a non-empty string');
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push('Description must be a non-empty string');
    } else if (data.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }
  }

  if (data.frequency !== undefined) {
    const validFrequencies = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'];
    if (!validFrequencies.includes(data.frequency)) {
      errors.push(`Frequency must be one of: ${validFrequencies.join(', ')}`);
    }
  }

  if (data.startDate !== undefined) {
    const dateObj = new Date(data.startDate);
    if (isNaN(dateObj.getTime())) {
      errors.push('Start date must be a valid ISO date string');
    }
  }

  if (data.endDate !== undefined && data.endDate !== null) {
    const dateObj = new Date(data.endDate);
    if (isNaN(dateObj.getTime())) {
      errors.push('End date must be a valid ISO date string');
    }
  }

  if (data.autoGenerate !== undefined && typeof data.autoGenerate !== 'boolean') {
    errors.push('autoGenerate must be a boolean');
  }

  if (data.reminderDays !== undefined) {
    if (typeof data.reminderDays !== 'number' || data.reminderDays < 0 || data.reminderDays > 30) {
      errors.push('reminderDays must be a number between 0 and 30');
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
  validateRecurringExpense,
  sanitizeRecurringExpense,
  validatePartialRecurringExpense
};