// backend/src/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { db, auth } = require('./config/firebase');
const { verifyToken } = require('./middleware/auth');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');
const cron = require('node-cron');
const { generateDueExpenses } = require('./controllers/recurringExpenseController');

// Import route files
const expenseRoutes = require('./routes/expenseRoutes');
const aiRoutes = require('./routes/aiRoutes');
const recurringExpenseRoutes = require('./routes/recurringExpensesRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * TRUST PROXY - IMPORTANT FOR RENDER
 */
app.set('trust proxy', 1);

/**
 * CORS CONFIGURATION - COMPREHENSIVE FIX
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://paisa-smart-expense-tracker.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Simple CORS - allow all origins temporarily for debugging
app.use(cors({
  origin: '*', // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

/**
 * MIDDLEWARE - Must come BEFORE routes
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'OPTIONS') {
    console.log('  → Preflight request from:', req.headers.origin);
  }
  next();
});

/**
 * PUBLIC ROUTES
 */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Smart Expense Tracker API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      expenses: '/api/expenses',
      budgets: '/api/budgets',
      recurringExpenses: '/api/recurring-expenses',
      ai: '/api/ai'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test DB endpoint
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test-db', asyncHandler(async (req, res) => {
    const testDoc = await db.collection('test').doc('connection').get();
    
    res.status(200).json({
      status: 'Connected to Firestore',
      exists: testDoc.exists,
      data: testDoc.data() || null
    });
  }));
}

/**
 * PROTECTED ROUTES
 */
app.get('/api/protected', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'You are authenticated!',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      emailVerified: req.user.emailVerified
    }
  });
});

app.get('/api/user/profile', verifyToken, asyncHandler(async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user.uid).get();
  
  if (!userDoc.exists) {
    const newUser = {
      email: req.user.email,
      createdAt: new Date().toISOString(),
      preferences: {
        currency: 'USD',
        defaultCategories: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other']
      }
    };
    
    await db.collection('users').doc(req.user.uid).set(newUser);
    
    return res.status(201).json({
      message: 'User profile created',
      user: newUser
    });
  }
  
  res.status(200).json({
    user: userDoc.data()
  });
}));

/**
 * API ROUTES
 */
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recurring-expenses', recurringExpenseRoutes);
app.use('/api/budgets', budgetRoutes);

/**
 * ERROR HANDLING
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * CRON JOBS
 */
if (process.env.NODE_ENV === 'production') {
  cron.schedule('0 0 * * *', async () => {
    console.log('═══════════════════════════════════════');
    console.log('🕐 Running scheduled recurring expense generation...');
    console.log('Time:', new Date().toISOString());
    
    const result = await generateDueExpenses();
    
    if (result.success) {
      console.log(`✅ Successfully generated ${result.generated} recurring expenses`);
    } else {
      console.error(`❌ Cron job failed: ${result.error}`);
    }
    
    console.log('═══════════════════════════════════════');
  });
  
  console.log('⏰ Cron job scheduled: Daily at midnight UTC');
}

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('✅ Server running on port ' + PORT);
  console.log('✅ Environment: ' + process.env.NODE_ENV);
  console.log('✅ Firebase Project: ' + process.env.FIREBASE_PROJECT_ID);
  console.log('✅ Allowed origins:', allowedOrigins.join(', '));
  console.log('═══════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});