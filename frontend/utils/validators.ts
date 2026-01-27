import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z.number().min(0.01).max(1000000),
  category: z.string().min(1),
  description: z.string().min(1).max(500),
  date: z.string().min(1),
  aiSuggested: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Update schema
export const recurringExpenseSchema = z.object({
  templateName: z.string().min(1, 'Name is required').max(100, 'Name too long'), // ✅ Changed
  amount: z.number().min(0.01).max(1000000),
  category: z.string().min(1),
  description: z.string().min(1).max(500),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  autoGenerate: z.boolean().optional(),
  reminderDays: z.number().min(0).max(30).optional(), // ✅ Added
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RecurringExpenseFormData = z.infer<typeof recurringExpenseSchema>;