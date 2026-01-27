import { apiClient } from '@/lib/axios';
import {
  Expense,
  CreateExpenseDto,
  ExpensesResponse,
  ExpenseStats,
  RecurringExpense,
  CreateRecurringExpenseDto,
  UpdateRecurringExpenseDto,
  UpcomingRecurringExpense,
  Budget,
  BudgetProgress,
  CreateBudgetDto,
  UpdateBudgetDto,
  RecurringExpensesResponse
} from '@/types/api.types';

export class ApiService {
  static async getExpenses(params?: Record<string, any>): Promise<ExpensesResponse> {
    const { data } = await apiClient.get('/expenses', { params });
    return data;
  }

  static async createExpense(expenseData: CreateExpenseDto): Promise<{ expense: Expense }> {
    const { data } = await apiClient.post('/expenses', expenseData);
    return data;
  }

  static async updateExpense(id: string, expenseData: Partial<CreateExpenseDto>): Promise<{ expense: Expense }> {
    const { data } = await apiClient.put(`/expenses/${id}`, expenseData);
    return data;
  }

  static async deleteExpense(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`/expenses/${id}`);
    return data;
  }

  static async getExpenseStats(params?: Record<string, any>): Promise<ExpenseStats> {
    const { data } = await apiClient.get('/expenses/stats/summary', { params });
    return data;
  }

  static async getSuggestedCategory(description: string): Promise<{ category: string }> {
    const { data } = await apiClient.post('/ai/suggest-category', { description });
    return data;
  }

  // Add these methods to your existing ApiService class

// Recurring Expenses
static async getRecurringExpenses(): Promise<RecurringExpensesResponse> {
  const { data } = await apiClient.get('/recurring-expenses');
  return data;
}

static async getRecurringExpenseById(id: string): Promise<{ recurringExpense: RecurringExpense }> {
  const { data } = await apiClient.get(`/recurring-expenses/${id}`);
  return data;
}

static async createRecurringExpense(
  expenseData: CreateRecurringExpenseDto
): Promise<{ recurringExpense: RecurringExpense }> {
  const { data } = await apiClient.post('/recurring-expenses', expenseData);
  return data;
}

static async updateRecurringExpense(
  id: string,
  expenseData: UpdateRecurringExpenseDto
): Promise<{ recurringExpense: RecurringExpense }> {
  const { data } = await apiClient.put(`/recurring-expenses/${id}`, expenseData);
  return data;
}

static async deleteRecurringExpense(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/recurring-expenses/${id}`);
  return data;
}

static async getUpcomingRecurringExpenses(): Promise<{ upcoming: UpcomingRecurringExpense[] }> {
  const { data } = await apiClient.get('/recurring-expenses/upcoming');
  return data;
}

static async generateRecurringExpense(id: string): Promise<{ expense: Expense; message: string }> {
  const { data } = await apiClient.post(`/recurring-expenses/${id}/generate`);
  return data;
}

// Budgets
static async getBudgets(): Promise<{ budgets: Budget[] }> {
  const { data } = await apiClient.get('/budgets');
  return data;
}

static async getCurrentBudget(): Promise<{ budget: Budget | null }> {
  const { data } = await apiClient.get('/budgets/current');
  return data;
}

static async getBudgetById(id: string): Promise<{ budget: Budget }> {
  const { data } = await apiClient.get(`/budgets/${id}`);
  return data;
}

static async getBudgetProgress(id: string): Promise<BudgetProgress> {
  const { data } = await apiClient.get(`/budgets/${id}/progress`);
  return data;
}

static async createBudget(budgetData: CreateBudgetDto): Promise<{ budget: Budget }> {
  const { data } = await apiClient.post('/budgets', budgetData);
  return data;
}

static async updateBudget(id: string, budgetData: UpdateBudgetDto): Promise<{ budget: Budget }> {
  const { data } = await apiClient.put(`/budgets/${id}`, budgetData);
  return data;
}

static async deleteBudget(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/budgets/${id}`);
  return data;
}

static async configureBudgetAlerts(
  id: string,
  alerts: { category: string; threshold: number }[]
): Promise<{ budget: Budget }> {
  const { data } = await apiClient.post(`/budgets/${id}/alerts`, { alerts });
  return data;
}
}

