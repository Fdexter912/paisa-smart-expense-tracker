'use client'

import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/services/api.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TrendingUp, Calendar } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const CurrentBudgetWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['current-budget'],
    queryFn: () => ApiService.getCurrentBudget(),
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

  if (!data?.budget) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No active budget for current period</p>
            <Link href="/budgets">
              <Button>Create Budget</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { budget } = data;
  const percentageUsed = (budget.totalSpent / budget.totalLimit) * 100;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {budget.name}
          </CardTitle>
          <Link href={`/budgets`}>
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(budget.period.startDate)} - {formatDate(budget.period.endDate)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Spent</p>
              <p className="text-lg font-bold">{formatCurrency(budget.totalSpent)}</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Remaining</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(budget.totalRemaining)}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Budget Progress</span>
              <span className="font-medium">{Math.round(percentageUsed)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  percentageUsed < 70 ? 'bg-green-500' :
                  percentageUsed < 90 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          </div>

          {budget.categoryBudgets.slice(0, 3).map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cat.category}</span>
              <span className="font-medium">
                {formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};