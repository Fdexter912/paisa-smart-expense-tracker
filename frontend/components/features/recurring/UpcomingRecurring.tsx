'use client'

import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/services/api.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CATEGORY_ICONS } from '@/utils/constants';
import { Calendar, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const UpcomingRecurring = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['upcoming-recurring'],
    queryFn: () => ApiService.getUpcomingRecurringExpenses(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Recurring Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!data?.upcoming || data.upcoming.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Recurring Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming recurring expenses
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Recurring Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.upcoming.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {CATEGORY_ICONS[expense.category] || '📌'}
                </span>
                <div>
                  <p className="font-medium">{expense.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(expense.nextOccurrence)}</span>
                    <span>({expense.daysUntil} days)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(expense.amount)}</p>
                <p className="text-xs text-muted-foreground">{expense.category}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};