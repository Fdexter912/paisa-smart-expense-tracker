import { apiClient } from '@/lib/axios';
import {
  Expense,
  CreateExpenseDto,
  ExpensesResponse,
  ExpenseStats,
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
}