# 💰 Paisa - Smart Expense Tracker

**AI-powered expense tracking with intelligent categorization, budget management, and recurring expense automation.**

A full-stack web application that helps users track and manage their expenses with the power of AI. Get automatic transaction categorization, set budgets, manage recurring expenses, and visualize spending patterns.

## 🎯 Features

- **🤖 AI-Powered Categorization**: Automatically categorizes transactions using Google's Gemini API
- **💳 Multi-Currency Support**: Track expenses in different currencies
- **📊 Dashboard Analytics**: Visual insights into spending patterns with charts and statistics
- **💰 Budget Management**: Set and monitor budgets by category
- **🔄 Recurring Expenses**: Automate and track recurring bills and subscriptions
- **🔐 Secure Authentication**: Firebase authentication with JWT tokens
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⚡ Real-Time Updates**: Instant expense tracking and updates

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth & JWT
- **AI**: Google Gemini API
- **Deployment**: Render

### Frontend
- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **API Client**: Axios with React Query
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Firebase project with Firestore enabled
- Google Gemini API key
- (Optional) Render or Vercel accounts for deployment

## 🚀 Getting Started

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd paisa-smart-expense-tracker/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Firebase Configuration
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   
   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd paisa-smart-expense-tracker/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local` file**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

## 📚 Project Structure

```
paisa-smart-expense-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          # Firebase and configuration setup
│   │   ├── controllers/      # Business logic and API handlers
│   │   ├── middleware/       # Authentication and error handling
│   │   ├── models/           # Database schemas and queries
│   │   ├── routes/           # API endpoint definitions
│   │   └── server.js         # Express server setup
│   └── package.json
├── frontend/
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and Firebase setup
│   ├── services/             # API service layer
│   ├── store/                # Zustand state management
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Helper functions
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### AI Categorization
- `POST /api/ai/categorize` - Categorize transaction using AI

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget

### Recurring Expenses
- `GET /api/recurring` - Get recurring expenses
- `POST /api/recurring` - Create recurring expense
- `PUT /api/recurring/:id` - Update recurring expense

## 💻 Development Commands

### Backend
```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm test         # Run tests (if configured)
```

### Frontend
```bash
npm run dev      # Start development server on port 3000
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🌐 Deployment

### Backend (Render)
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

## 🔐 Environment Variables

See `.env.example` files in each directory for complete configuration options.

**Critical variables:**
- Firebase credentials (API Key, Project ID, etc.)
- Gemini API Key
- Node environment settings
- Frontend/Backend URLs for CORS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Fahama Abdul Rehman**

## 📞 Support

For support, issues, or questions:
- Open an issue on GitHub
- Check existing documentation
- Review API error messages for debugging

---

Made with ❤️ for expense tracking enthusiasts
