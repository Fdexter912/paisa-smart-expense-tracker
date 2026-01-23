'use client'

import { Expense } from '@/types/api.types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CATEGORY_ICONS } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Sparkles } from 'lucide-react';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseItem = ({ expense, onEdit, onDelete }: ExpenseItemProps) => {
  return (
    <Card className="p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] border-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              {CATEGORY_ICONS[expense.category] || '📌'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(expense.amount)}
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {expense.category}
              </span>
              {expense.aiSuggested && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Suggested
                </span>
              )}
            </div>
            <p className="text-base text-foreground/90 mb-2 line-clamp-2">
              {expense.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDate(expense.date)}</span>
              <span>•</span>
              <span className="text-xs">
                Added {formatDate(expense.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(expense)}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(expense.id)}
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};