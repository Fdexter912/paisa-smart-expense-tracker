'use client'

import { ExpenseStats } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, DollarSign, Receipt } from 'lucide-react';

interface StatsCardsProps {
  stats: ExpenseStats | null;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  if (!stats) return null;

  const cards = [
    {
      title: 'Total Expenses',
      value: stats.summary.totalExpenses,
      icon: Receipt,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Amount',
      value: formatCurrency(stats.summary.totalAmount),
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Average',
      value: formatCurrency(stats.summary.averageExpense),
      icon: TrendingUp,
      gradient: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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