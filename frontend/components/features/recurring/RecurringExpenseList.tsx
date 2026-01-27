'use client'

import { RecurringExpense } from '@/types/api.types';
import { RecurringExpenseItem } from './RecurringExpenseItem';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface RecurringExpenseListProps {
  expenses: RecurringExpense[];
  isLoading: boolean;
  onEdit: (expense: RecurringExpense) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onGenerate: (id: string) => void;
}

export const RecurringExpenseList = ({
  expenses,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
  onGenerate,
}: RecurringExpenseListProps) => {
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
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-lg font-semibold mb-2">No recurring expenses yet</h3>
          <p className="text-muted-foreground">
            Create your first recurring expense to automate your expense tracking!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <RecurringExpenseItem
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          onGenerate={onGenerate}
        />
      ))}
    </div>
  );
};