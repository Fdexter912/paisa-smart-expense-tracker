// backend/test-ai-categorization.js
// Test AI categorization feature

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

let idToken = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Get auth token
async function getAuthToken() {
  try {
    log('\n🔐 Getting authentication token...', 'blue');
    
    const response = await axios.post(`${BASE_URL}/api/test/get-token`, {
      email: 'test@example.com'
    });
    
    const customToken = response.data.customToken;
    
    const authResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
      { token: customToken, returnSecureToken: true }
    );
    
    idToken = authResponse.data.idToken;
    log('✅ Authentication successful\n', 'green');
    
  } catch (error) {
    log('❌ Authentication failed', 'red');
    process.exit(1);
  }
}

// Test descriptions
const testDescriptions = [
  { description: 'Coffee at Starbucks', amount: 5.50 },
  { description: 'Uber ride to airport', amount: 35.00 },
  { description: 'Monthly Netflix subscription', amount: 15.99 },
  { description: 'Groceries from Whole Foods', amount: 85.30 },
  { description: 'Electricity bill payment', amount: 120.00 },
  { description: 'Doctor appointment copay', amount: 25.00 },
  { description: 'New running shoes from Nike', amount: 95.00 },
  { description: 'Flight tickets to NYC', amount: 450.00 },
  { description: 'Haircut and styling', amount: 40.00 },
  { description: 'Gym membership monthly fee', amount: 50.00 }
];

// Test category suggestions
async function testCategorySuggestions() {
  log('╔═══════════════════════════════════════════════════════╗', 'cyan');
  log('║       AI CATEGORY SUGGESTION TESTS                    ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════╝', 'cyan');

  for (const test of testDescriptions) {
    try {
      log(`\n📝 Testing: "${test.description}" ($${test.amount})`, 'yellow');
      
      const response = await axios.post(
        `${BASE_URL}/api/ai/suggest-category`,
        test,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      const suggestion = response.data.suggestion;
      
      log(`✅ Category: ${suggestion.category}`, 'green');
      log(`   Confidence: ${suggestion.confidence}%`, 'cyan');
      log(`   Reasoning: ${suggestion.reasoning}`, 'cyan');
      log(`   AI Generated: ${suggestion.aiGenerated ? 'Yes' : 'No (Fallback)'}`, 'cyan');

    } catch (error) {
      log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
    }
  }
}

// Test get categories
async function testGetCategories() {
  log('\n\n╔═══════════════════════════════════════════════════════╗', 'cyan');
  log('║       GET CATEGORIES TEST                             ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════╝', 'cyan');

  try {
    const response = await axios.get(
      `${BASE_URL}/api/ai/categories`,
      { headers: { Authorization: `Bearer ${idToken}` } }
    );

    log('\n✅ Available Categories:', 'green');
    response.data.categories.forEach((cat, index) => {
      log(`   ${index + 1}. ${cat}`, 'cyan');
    });
    log(`\nTotal: ${response.data.total} categories`, 'blue');

  } catch (error) {
    log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
  }
}

// Test update categories
async function testUpdateCategories() {
  log('\n\n╔═══════════════════════════════════════════════════════╗', 'cyan');
  log('║       UPDATE CATEGORIES TEST                          ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════╝', 'cyan');

  try {
    const customCategories = [
      'Food',
      'Transport',
      'Entertainment',
      'Shopping',
      'Bills',
      'Health',
      'Education',
      'Other'
    ];

    const response = await axios.put(
      `${BASE_URL}/api/ai/categories`,
      { categories: customCategories },
      { headers: { Authorization: `Bearer ${idToken}` } }
    );

    log('\n✅ Categories updated successfully', 'green');
    log('New categories:', 'cyan');
    response.data.categories.forEach((cat, index) => {
      log(`   ${index + 1}. ${cat}`, 'cyan');
    });

  } catch (error) {
    log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
  }
}

// Run all tests
async function runAllTests() {
  await getAuthToken();
  await testGetCategories();
  await testCategorySuggestions();
  await testUpdateCategories();
  
  log('\n\n╔═══════════════════════════════════════════════════════╗', 'blue');
  log('║       ALL AI TESTS COMPLETED                          ║', 'blue');
  log('╚═══════════════════════════════════════════════════════╝', 'blue');
  log('\n');
}

runAllTests();