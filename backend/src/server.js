// backend/src/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { db, auth } = require('./config/firebase');
const { verifyToken } = require('./middleware/auth');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * MIDDLEWARE
 */
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(timestamp + ' - ' + req.method + ' ' + req.path);
  next();
});

/**
 * PUBLIC ROUTES
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-db', asyncHandler(async (req, res) => {
  const testDoc = await db.collection('test').doc('connection').get();
  
  res.status(200).json({
    status: 'Connected to Firestore',
    exists: testDoc.exists,
    data: testDoc.data() || null
  });
}));

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
        defaultCategories: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other']
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
 * ERROR HANDLING
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log('✅ Server running on http://localhost:' + PORT);
  console.log('✅ Environment: ' + process.env.NODE_ENV);
  console.log('✅ Firebase Project: ' + process.env.FIREBASE_PROJECT_ID);
});