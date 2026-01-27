'use client'

import { Budget } from '@/types/api.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface BudgetListProps {
  budgets: Budget[];
  isLoading: boolean;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export const BudgetList = ({ budgets, isLoading, onEdit, onDelete, onView }: BudgetListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/50 rounded-lg border-2 border-dashed">
        <div className="mx-auto max-w-md">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
          <p className="text-muted-foreground">
            Create your first budget to start tracking your spending!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const percentageUsed = (budget.totalSpent / budget.totalLimit) * 100;
        const isOverBudget = budget.totalSpent > budget.totalLimit;

        return (
          <Card key={budget.id} className="p-5 hover:shadow-lg transition-all duration-200 border-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold">{budget.name}</h3>
                  {budget.isActive ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {budget.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(budget.period.startDate)} - {formatDate(budget.period.endDate)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Limit</p>
                    <p className="text-lg font-semibold">{formatCurrency(budget.totalLimit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {formatCurrency(budget.totalSpent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className={`text-lg font-semibold ${
                      isOverBudget ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(budget.totalRemaining)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(percentageUsed)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentageUsed < 70 ? 'bg-green-500' :
                        percentageUsed < 90 ? 'bg-yellow-500' :
                        percentageUsed < 100 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                  {budget.categoryBudgets.length} categories •{' '}
                  {budget.alerts.length} alerts configured
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(budget.id)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(budget)}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(budget.id)}
                  className="w-full hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};