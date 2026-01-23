// backend/src/controllers/aiController.js

/**
 * AI Controller
 * 
 * Handles AI-powered expense categorization
 */

const { suggestCategory, DEFAULT_CATEGORIES } = require('../config/ai');
const { db } = require('../config/firebase');

/**
 * Get category suggestion from AI
 * 
 * @route   POST /api/ai/suggest-category
 * @access  Private
 * @body    { description, amount? }
 */
const getCategorySuggestion = async (req, res) => {
  try {
    const { description, amount } = req.body;
    const userId = req.user.uid;

    // Validate input
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        error: 'Description is required',
        message: 'Please provide an expense description'
      });
    }

    if (description.length > 500) {
      return res.status(400).json({
        error: 'Description too long',
        message: 'Description must be less than 500 characters'
      });
    }

    // Get user's custom categories from their profile
    let userCategories = DEFAULT_CATEGORIES;
    
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.preferences && userData.preferences.defaultCategories) {
          userCategories = userData.preferences.defaultCategories;
        }
      }
    } catch (error) {
      console.log('Could not fetch user categories, using defaults');
    }

    // Get AI suggestion
    const suggestion = await suggestCategory(
      description,
      amount,
      userCategories
    );

    // Return suggestion
    res.status(200).json({
      suggestion: {
        category: suggestion.category,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning,
        aiGenerated: suggestion.aiGenerated
      },
      description: description,
      amount: amount || null
    });

  } catch (error) {
    console.error('Error getting category suggestion:', error);
    res.status(500).json({
      error: 'Failed to get category suggestion',
      message: error.message
    });
  }
};

/**
 * Get available categories for the user
 * 
 * @route   GET /api/ai/categories
 * @access  Private
 */
const getCategories = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get user's custom categories
    const userDoc = await db.collection('users').doc(userId).get();
    
    let categories = DEFAULT_CATEGORIES;
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.preferences && userData.preferences.defaultCategories) {
        categories = userData.preferences.defaultCategories;
      }
    }

    res.status(200).json({
      categories: categories,
      total: categories.length
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
};

/**
 * Update user's custom categories
 * 
 * @route   PUT /api/ai/categories
 * @access  Private
 * @body    { categories: [] }
 */
const updateCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    const userId = req.user.uid;

    // Validate input
    if (!Array.isArray(categories)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Categories must be an array'
      });
    }

    if (categories.length === 0) {
      return res.status(400).json({
        error: 'Empty categories',
        message: 'At least one category is required'
      });
    }

    if (categories.length > 30) {
      return res.status(400).json({
        error: 'Too many categories',
        message: 'Maximum 30 categories allowed'
      });
    }

    // Validate each category
    for (const category of categories) {
      if (typeof category !== 'string' || category.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid category',
          message: 'All categories must be non-empty strings'
        });
      }
      if (category.length > 50) {
        return res.status(400).json({
          error: 'Category too long',
          message: 'Each category must be less than 50 characters'
        });
      }
    }

    // Update user's categories
    const userRef = db.collection('users').doc(userId);
    
    await userRef.set({
      preferences: {
        defaultCategories: categories.map(cat => cat.trim())
      }
    }, { merge: true });

    res.status(200).json({
      message: 'Categories updated successfully',
      categories: categories.map(cat => cat.trim())
    });

  } catch (error) {
    console.error('Error updating categories:', error);
    res.status(500).json({
      error: 'Failed to update categories',
      message: error.message
    });
  }
};

module.exports = {
  getCategorySuggestion,
  getCategories,
  updateCategories
};