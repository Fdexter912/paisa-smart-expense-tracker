export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
  aiSuggested: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  amount: number;
  category: string;
  description: string;
  date: string;
  aiSuggested?: boolean;
}

export interface ExpenseStats {
  summary: {
    totalExpenses: number;
    totalAmount: number;
    averageExpense: number;
    dateRange: { start: string; end: string };
  };
  categoryBreakdown: {
    category: string;
    count: number;
    total: number;
    percentage: number;
  }[];
}

export interface ExpensesResponse {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalExpenses: number;
    totalAmount: number;
  };
}

// Update RecurringExpense interface
export interface RecurringExpense {
  id: string;
  userId: string;
  templateName: string; // ✅ Changed from 'name'
  amount: number;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  lastGenerated?: string;
  isActive: boolean;
  autoGenerate: boolean;
  reminderDays?: number; // ✅ Added
  createdAt: string;
  updatedAt: string;
}

// Update DTO
export interface CreateRecurringExpenseDto {
  templateName: string; // ✅ Changed from 'name'
  amount: number;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive?: boolean;
  autoGenerate?: boolean;
  reminderDays?: number; // ✅ Added
}

export interface UpdateRecurringExpenseDto extends Partial<CreateRecurringExpenseDto> {}

export interface RecurringExpensesResponse {
  recurringExpenses: RecurringExpense[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    estimatedMonthly: number;
  };
}

export interface UpcomingRecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  nextOccurrence: string;
  daysUntil: number;
}

export interface CategoryBudget {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetAlert {
  category: string;
  threshold: number;
  triggered: boolean;
  triggeredAt?: string;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  type: 'monthly' | 'weekly' | 'custom';
  period: {
    startDate: string;
    endDate: string;
  };
  categoryBudgets: CategoryBudget[];
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  alerts: BudgetAlert[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetDto {
  name: string;
  type: 'monthly' | 'weekly' | 'custom';
  period: {
    startDate: string;
    endDate: string;
  };
  categoryBudgets: {
    category: string;
    limit: number;
  }[];
  alerts?: {
    category: string;
    threshold: number;
  }[];
  isActive?: boolean;
}

export interface UpdateBudgetDto extends Partial<CreateBudgetDto> {}

export interface BudgetProgress {
  budget: Budget;
  overall: {
    totalLimit: number;
    totalSpent: number;
    totalRemaining: number;
    percentageUsed: number;
    status: 'on-track' | 'warning' | 'over-budget';
  };
  categoryProgress: {
    category: string;
    limit: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: 'safe' | 'warning' | 'critical' | 'exceeded';
  }[];
  triggeredAlerts: BudgetAlert[];
}