'use client'

import { ExpenseStats } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartComponentProps {
  stats: ExpenseStats | null;
}

export const BarChartComponent = ({ stats }: BarChartComponentProps) => {
  if (!stats || stats.categoryBreakdown.length === 0) return null;

  const data = stats.categoryBreakdown.map(item => ({
    category: item.category,
    amount: item.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};