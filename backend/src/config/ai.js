// backend/src/config/ai.js

/**
 * AI Configuration for Expense Categorization
 *
 * Uses Google's Gemini API to intelligently categorize expenses
 */

const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

// Initialize Gemini client
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  model = "gemini-3-flash-preview"; // Fast and free!
}

/**
 * Default expense categories
 */
const DEFAULT_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Personal Care",
  "Home & Garden",
  "Insurance",
  "Investments",
  "Gifts & Donations",
  "Other",
];

/**
 * Get AI category suggestion based on expense description
 *
 * @param {string} description - Expense description
 * @param {number} amount - Expense amount (optional)
 * @param {Array} userCategories - User's custom categories (optional)
 * @returns {Promise<Object>} - { category, confidence, reasoning }
 */
async function suggestCategory(
  description,
  amount = null,
  userCategories = null,
) {
  const categories =
    userCategories && userCategories.length > 0
      ? userCategories
      : DEFAULT_CATEGORIES;

  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY || !model) {
      console.warn("⚠️  GEMINI_API_KEY not found in environment");
      return fallbackCategorization(description, categories);
    }

    console.log("🤖 Calling Gemini API for:", description);

    // Build the prompt
    const prompt = buildCategoryPrompt(description, amount, categories);

    // Call Gemini API
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const responseText = result.text?.trim();

    if (!responseText) {
      throw new Error("Empty response from Gemini");
    }

    // Log for debugging
    console.log("✅ Gemini Response:", responseText.substring(0, 150) + "...");

    // Parse response
    const parsedResult = parseCategoryResponse(responseText, categories);

    return parsedResult;
  } catch (error) {
    console.error("❌ AI categorization error:");
    console.error("   Error type:", error.constructor.name);
    console.error("   Error message:", error.message);

    // Fallback to rule-based categorization
    console.log("📋 Using fallback categorization");
    return fallbackCategorization(description, categories);
  }
}

/**
 * Build the prompt for Gemini
 *
 * @param {string} description - Expense description
 * @param {number} amount - Expense amount
 * @param {Array} categories - Available categories
 * @returns {string} - Formatted prompt
 */
function buildCategoryPrompt(description, amount, categories) {
  let prompt = `You are an expense categorization assistant. Analyze the following expense and suggest the most appropriate category.

Expense Description: "${description}"`;

  if (amount) {
    prompt += `\nAmount: $${amount}`;
  }

  prompt += `\n\nAvailable Categories:
${categories.map((cat, index) => `${index + 1}. ${cat}`).join("\n")}

Instructions:
1. Choose the MOST appropriate category from the list above
2. Provide a confidence score (0-100)
3. Give a brief reason for your choice

Respond ONLY in this exact JSON format (no markdown, no code blocks):
{
  "category": "exact category name from the list",
  "confidence": 85,
  "reasoning": "brief explanation"
}`;

  return prompt;
}

/**
 * Parse Gemini's response
 *
 * @param {string} responseText - Gemini's response
 * @param {Array} categories - Available categories
 * @returns {Object} - Parsed result
 */
function parseCategoryResponse(responseText, categories) {
  try {
    // Remove markdown code blocks if present
    let cleanText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanText);

    // Validate that the category is in our list (case-insensitive)
    const category = categories.find(
      (cat) => cat.toLowerCase() === parsed.category.toLowerCase(),
    );

    // If category not found, look for partial match
    const partialMatch =
      category ||
      categories.find((cat) => {
        const catLower = cat.toLowerCase();
        const parsedLower = parsed.category.toLowerCase();
        return catLower.includes(parsedLower) || parsedLower.includes(catLower);
      });

    // If still not found, use 'Other' or last category
    const finalCategory =
      partialMatch ||
      categories.find((cat) => cat.toLowerCase().includes("other")) ||
      categories[categories.length - 1];

    return {
      category: finalCategory,
      confidence: Math.min(100, Math.max(0, parsed.confidence || 75)),
      reasoning: parsed.reasoning || "AI-suggested category",
      aiGenerated: true,
    };
  } catch (error) {
    console.error("Error parsing AI response:", error.message);
    console.error("Raw response:", responseText);

    // If parsing fails, try to extract category name directly
    const foundCategory = categories.find((cat) =>
      responseText.toLowerCase().includes(cat.toLowerCase()),
    );

    if (foundCategory) {
      return {
        category: foundCategory,
        confidence: 60,
        reasoning: "Category extracted from AI response",
        aiGenerated: true,
      };
    }

    // Ultimate fallback
    const otherCategory =
      categories.find((cat) => cat.toLowerCase().includes("other")) ||
      categories[categories.length - 1];

    return {
      category: otherCategory,
      confidence: 50,
      reasoning: "Could not parse AI response",
      aiGenerated: false,
    };
  }
}

/**
 * Fallback categorization using simple rules
 * Used when AI is unavailable
 *
 * @param {string} description - Expense description
 * @param {Array} categories - Available categories
 * @returns {Object} - Category suggestion
 */
function fallbackCategorization(description, categories) {
  const lowerDesc = description.toLowerCase();

  // Map of keywords to category names (flexible matching)
  const rules = [
    {
      keywords: [
        "restaurant",
        "cafe",
        "coffee",
        "starbucks",
        "pizza",
        "lunch",
        "dinner",
        "breakfast",
        "food",
        "eat",
        "meal",
      ],
      categoryMatch: ["food", "dining"],
    },
    {
      keywords: [
        "uber",
        "taxi",
        "lyft",
        "bus",
        "train",
        "metro",
        "parking",
        "gas",
        "fuel",
        "car",
        "vehicle",
      ],
      categoryMatch: ["transport", "travel", "vehicle"],
    },
    {
      keywords: [
        "grocery",
        "groceries",
        "supermarket",
        "walmart",
        "trader joe",
        "whole foods",
        "vegetables",
        "fruits",
      ],
      categoryMatch: ["grocery", "groceries", "food"],
    },
    {
      keywords: [
        "movie",
        "cinema",
        "netflix",
        "spotify",
        "concert",
        "game",
        "theater",
        "entertainment",
      ],
      categoryMatch: ["entertainment", "leisure"],
    },
    {
      keywords: [
        "electricity",
        "water",
        "internet",
        "phone",
        "rent",
        "mortgage",
        "utility",
        "bill",
      ],
      categoryMatch: ["bill", "utility", "utilities"],
    },
    {
      keywords: [
        "doctor",
        "hospital",
        "pharmacy",
        "medicine",
        "clinic",
        "dental",
        "health",
        "medical",
      ],
      categoryMatch: ["health", "healthcare", "medical"],
    },
    {
      keywords: [
        "amazon",
        "shopping",
        "mall",
        "store",
        "clothes",
        "shoes",
        "purchase",
      ],
      categoryMatch: ["shopping", "retail"],
    },
    {
      keywords: [
        "flight",
        "hotel",
        "airbnb",
        "vacation",
        "travel",
        "trip",
        "airline",
        "tickets",
      ],
      categoryMatch: ["travel", "vacation"],
    },
    {
      keywords: [
        "gym",
        "fitness",
        "salon",
        "spa",
        "haircut",
        "beauty",
        "barber",
        "styling",
        "personal",
      ],
      categoryMatch: ["personal", "care"],
    },
    {
      keywords: ["insurance", "premium", "policy"],
      categoryMatch: ["insurance"],
    },
    {
      keywords: [
        "school",
        "university",
        "course",
        "education",
        "tuition",
        "books",
      ],
      categoryMatch: ["education", "learning"],
    },
  ];

  // Find matching rule
  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (lowerDesc.includes(keyword)) {
        // Try to find a category that matches
        const matchedCategory = categories.find((cat) => {
          const lowerCat = cat.toLowerCase();
          return rule.categoryMatch.some((match) => lowerCat.includes(match));
        });

        if (matchedCategory) {
          return {
            category: matchedCategory,
            confidence: 70,
            reasoning: `Matched keyword: "${keyword}"`,
            aiGenerated: false,
          };
        }
      }
    }
  }

  // No match found
  const otherCategory =
    categories.find((cat) => cat.toLowerCase().includes("other")) ||
    categories[categories.length - 1];

  return {
    category: otherCategory,
    confidence: 50,
    reasoning: "No matching pattern found - using default category",
    aiGenerated: false,
  };
}

/**
 * Validate AI service is available
 *
 * @returns {Promise<boolean>}
 */
async function validateAIService() {
  try {
    if (!process.env.GEMINI_API_KEY || !genAI) {
      console.warn(
        "⚠️  GEMINI_API_KEY not set. AI categorization will use fallback.",
      );
      return false;
    }

    if (!model) {
      console.warn("⚠️  Gemini model not initialized.");
      return false;
    }

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Say OK",
    });

    return Boolean(result.text);
  } catch (error) {
    console.error("AI service validation failed:", error.message);
    return false;
  }
}

module.exports = {
  suggestCategory,
  validateAIService,
  DEFAULT_CATEGORIES,
};
