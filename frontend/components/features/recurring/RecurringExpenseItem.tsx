'use client'

import { RecurringExpense } from '@/types/api.types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CATEGORY_ICONS } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Play, Pause, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecurringExpenseItemProps {
  expense: RecurringExpense;
  onEdit: (expense: RecurringExpense) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onGenerate: (id: string) => void;
}

export const RecurringExpenseItem = ({
  expense,
  onEdit,
  onDelete,
  onToggleActive,
  onGenerate,
}: RecurringExpenseItemProps) => {
  return (
    <Card className="p-5 hover:shadow-lg transition-all duration-200 border-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              {CATEGORY_ICONS[expense.category] || '📌'}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground">{expense.templateName}</h3>
              {expense.isActive ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
              {expense.autoGenerate && (
                <Badge variant="outline" className="text-xs">
                  Auto-generate
                </Badge>
              )}
            </div>

            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(expense.amount)}
                </span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {expense.frequency}
                </span>
                <span className="px-2 py-1 bg-muted rounded-full text-xs">
                  {expense.category}
                </span>
              </div>
              <p className="text-sm text-foreground/90">{expense.description}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Next: {formatDate(expense.nextOccurrence)}</span>
              </div>
              {expense.lastGenerated && (
                <span>Last: {formatDate(expense.lastGenerated)}</span>
              )}
              {expense.endDate && (
                <span>Ends: {formatDate(expense.endDate)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(expense)}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleActive(expense.id, !expense.isActive)}
            className="w-full"
          >
            {expense.isActive ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Activate
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGenerate(expense.id)}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-1" />
            Generate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(expense.id)}
            className="w-full hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};