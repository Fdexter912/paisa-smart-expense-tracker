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