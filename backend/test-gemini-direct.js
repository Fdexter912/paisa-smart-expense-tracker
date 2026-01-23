// backend/test-gemini-direct.js
// Direct test of Gemini API

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiAPI() {
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 
    process.env.GEMINI_API_KEY.substring(0, 15) + '...' : 
    'NOT FOUND');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment!');
    console.log('\nCheck:');
    console.log('1. Is .env file in backend/ folder?');
    console.log('2. Does it have GEMINI_API_KEY=...');
    console.log('3. Did you restart the server?');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    console.log('\n🤖 Testing Gemini API...');

    const prompt = `Categorize this expense: "Coffee at Starbucks". 
Choose from: Food, Transport, Entertainment. 
Respond in JSON format: {"category": "Food", "confidence": 95, "reasoning": "brief reason"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ SUCCESS! API is working!');
    console.log('\nResponse:', text);

  } catch (error) {
    console.error('❌ API call failed:');
    console.error('Type:', error.constructor.name);
    console.error('Message:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Your API key is invalid.');
      console.log('Get a new one at: https://aistudio.google.com/app/apikey');
    }
  }
}

testGeminiAPI();