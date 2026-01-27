import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return 'Invalid date';
  }
};

export const getBudgetStatus = (percentage: number): string => {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'safe';
};

export const getOverallBudgetStatus = (percentage: number): string => {
  if (percentage >= 100) return 'over-budget';
  if (percentage >= 80) return 'warning';
  return 'on-track';
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

