'use client'

import { RecurringExpensesResponse } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { Repeat, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface RecurringStatsCardsProps {
  data: RecurringExpensesResponse | null;
}

export const RecurringStatsCards = ({ data }: RecurringStatsCardsProps) => {
  if (!data) return null;

  const cards = [
    {
      title: 'Total Recurring',
      value: data.summary.total,
      icon: Repeat,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Active',
      value: data.summary.active,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Inactive',
      value: data.summary.inactive,
      icon: XCircle,
      gradient: 'from-gray-500 to-gray-600',
    },
    {
      title: 'Est. Monthly Cost',
      value: formatCurrency(data.summary.estimatedMonthly),
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-br ${card.gradient} text-white border-0 shadow-lg hover:shadow-xl transition-shadow`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium opacity-90">
              {card.title}
            </CardTitle>
            <card.icon className="h-5 w-5 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight">
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};