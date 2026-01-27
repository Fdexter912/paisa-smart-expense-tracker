export const CATEGORIES = [
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Other',
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#ef4444',
  Transport: '#3b82f6',
  Entertainment: '#8b5cf6',
  Shopping: '#ec4899',
  Bills: '#f59e0b',
  Healthcare: '#10b981',
  Education: '#06b6d4',
  Other: '#6366f1',
};

export const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍔',
  Transport: '🚗',
  Entertainment: '🎬',
  Shopping: '🛍️',
  Bills: '💡',
  Healthcare: '⚕️',
  Education: '📚',
  Other: '📌',
};

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📆' },
  { value: 'biweekly', label: 'Bi-weekly', icon: '🗓️' },
  { value: 'monthly', label: 'Monthly', icon: '📊' },
  { value: 'yearly', label: 'Yearly', icon: '🎂' },
] as const;

export const BUDGET_TYPES = [
  { value: 'monthly', label: 'Monthly', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📆' },
  { value: 'custom', label: 'Custom Period', icon: '🗓️' },
] as const;

export const ALERT_THRESHOLDS = [50, 70, 80, 90, 95, 100];

export const BUDGET_STATUS_COLORS = {
  'on-track': 'bg-green-100 text-green-700 dark:bg-green-900/30',
  'warning': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30',
  'over-budget': 'bg-red-100 text-red-700 dark:bg-red-900/30',
  'safe': 'text-green-600',
  'critical': 'text-red-600',
  'exceeded': 'text-red-700 font-bold',
};

export type Frequency = typeof FREQUENCIES[number]['value'];