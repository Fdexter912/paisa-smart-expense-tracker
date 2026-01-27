'use client'

import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/services/api.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage, getBudgetStatus, getOverallBudgetStatus } from '@/utils/formatters';
import { BUDGET_STATUS_COLORS, CATEGORY_ICONS } from '@/utils/constants';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/utils';

interface BudgetProgressCardProps {
  budgetId: string;
}

export const BudgetProgressCard = ({ budgetId }: BudgetProgressCardProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['budget-progress', budgetId],
    queryFn: () => ApiService.getBudgetProgress(budgetId),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load budget progress</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.overall) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No budget data available</p>
        </CardContent>
      </Card>
    );
  }

  const { overall, categoryProgress, triggeredAlerts } = data;
  const overallStatus = getOverallBudgetStatus(overall.percentageUsed);

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Overview</CardTitle>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              BUDGET_STATUS_COLORS[overallStatus as keyof typeof BUDGET_STATUS_COLORS]
            )}>
              {overallStatus === 'on-track' ? '✓ On Track' :
               overallStatus === 'warning' ? '⚠ Warning' : '❌ Over Budget'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Limit</p>
                <p className="text-2xl font-bold">{formatCurrency(overall.totalLimit)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(overall.totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={cn(
                  "text-2xl font-bold",
                  overall.totalRemaining >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(overall.totalRemaining)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{formatPercentage(overall.percentageUsed)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    overall.percentageUsed < 70 ? "bg-green-500" :
                    overall.percentageUsed < 90 ? "bg-yellow-500" :
                    overall.percentageUsed < 100 ? "bg-orange-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(overall.percentageUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Triggered Alerts */}
      {triggeredAlerts && triggeredAlerts.length > 0 && (
        <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <AlertTriangle className="h-5 w-5" />
              Budget Alerts ({triggeredAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {triggeredAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="font-medium">{alert.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {alert.threshold}% threshold reached
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {categoryProgress && categoryProgress.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryProgress.map((cat, index) => {
                const status = getBudgetStatus(cat.percentage);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CATEGORY_ICONS[cat.category] || '📌'}</span>
                        <span className="font-medium">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}
                        </p>
                        <p className={cn(
                          "text-xs",
                          BUDGET_STATUS_COLORS[status as keyof typeof BUDGET_STATUS_COLORS]
                        )}>
                          {formatPercentage(cat.percentage)}
                        </p>
                      </div>
                    </div>

                    {/* Category Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500",
                          status === 'safe' ? "bg-green-500" :
                          status === 'warning' ? "bg-yellow-500" :
                          status === 'critical' ? "bg-orange-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(cat.remaining)} remaining</span>
                      {cat.percentage >= 100 ? (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Over budget!
                        </span>
                      ) : cat.percentage >= 90 ? (
                        <span className="text-orange-600 font-medium flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Near limit
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          On track
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};