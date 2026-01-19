// backend/src/models/expenseModel.js

/**
 * Expense Data Validation
 * 
 * This file contains validation logic for expense data
 * Ensures data integrity before saving to database
 */

/**
 * Validate expense data
 * 
 * @param {Object} data - Expense data to validate
 * @returns {Object} - { isValid: boolean, errors: array }
 */
const validateExpense = (data) => {
  const errors = [];

  // 1. Validate amount
  if (!data.amount && data.amount !== 0) {
    errors.push('Amount is required');
  } else if (typeof data.amount !== 'number') {
    errors.push('Amount must be a number');
  } else if (data.amount < 0) {
    errors.push('Amount cannot be negative');
  } else if (data.amount > 1000000) {
    errors.push('Amount cannot exceed 1,000,000');
  }

  // 2. Validate category
  if (!data.category) {
    errors.push('Category is required');
  } else if (typeof data.category !== 'string') {
    errors.push('Category must be a string');
  } else if (data.category.trim().length === 0) {
    errors.push('Category cannot be empty');
  } else if (data.category.length > 50) {
    errors.push('Category must be less than 50 characters');
  }

  // 3. Validate description
  if (!data.description) {
    errors.push('Description is required');
  } else if (typeof data.description !== 'string') {
    errors.push('Description must be a string');
  } else if (data.description.trim().length === 0) {
    errors.push('Description cannot be empty');
  } else if (data.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  // 4. Validate date
  if (!data.date) {
    errors.push('Date is required');
  } else if (typeof data.date !== 'string') {
    errors.push('Date must be a string');
  } else {
    // Check if it's a valid ISO date format
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      errors.push('Date must be a valid ISO date string (YYYY-MM-DD)');
    }
  }

  // 5. Validate aiSuggested (optional field)
  if (data.aiSuggested !== undefined && typeof data.aiSuggested !== 'boolean') {
    errors.push('aiSuggested must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Sanitize expense data
 * Removes unwanted fields and trims strings
 * 
 * @param {Object} data - Raw expense data
 * @returns {Object} - Sanitized expense data
 */
const sanitizeExpense = (data) => {
  return {
    amount: parseFloat(data.amount),
    category: data.category.trim(),
    description: data.description.trim(),
    date: data.date,
    aiSuggested: data.aiSuggested || false
  };
};

/**
 * Validate partial expense data (for updates)
 * Allows optional fields
 * 
 * @param {Object} data - Partial expense data
 * @returns {Object} - { isValid: boolean, errors: array }
 */
const validatePartialExpense = (data) => {
  const errors = [];

  // Only validate fields that are present
  if (data.amount !== undefined) {
    if (typeof data.amount !== 'number') {
      errors.push('Amount must be a number');
    } else if (data.amount < 0) {
      errors.push('Amount cannot be negative');
    } else if (data.amount > 1000000) {
      errors.push('Amount cannot exceed 1,000,000');
    }
  }

  if (data.category !== undefined) {
    if (typeof data.category !== 'string') {
      errors.push('Category must be a string');
    } else if (data.category.trim().length === 0) {
      errors.push('Category cannot be empty');
    } else if (data.category.length > 50) {
      errors.push('Category must be less than 50 characters');
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description.trim().length === 0) {
      errors.push('Description cannot be empty');
    } else if (data.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }
  }

  if (data.date !== undefined) {
    if (typeof data.date !== 'string') {
      errors.push('Date must be a string');
    } else {
      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) {
        errors.push('Date must be a valid ISO date string');
      }
    }
  }

  if (data.aiSuggested !== undefined && typeof data.aiSuggested !== 'boolean') {
    errors.push('aiSuggested must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

module.exports = {
  validateExpense,
  sanitizeExpense,
  validatePartialExpense
};