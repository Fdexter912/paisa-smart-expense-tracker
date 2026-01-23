'use client'

import { Expense } from '@/types/api.types';
import { ExpenseItem } from './ExpenseItem';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseList = ({ expenses, isLoading, onEdit, onDelete }: ExpenseListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/50 rounded-lg border-2 border-dashed">
        <div className="mx-auto max-w-md">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
          <p className="text-muted-foreground">
            Click "Add New Expense" to track your first expense!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};