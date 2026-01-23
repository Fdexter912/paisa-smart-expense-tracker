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