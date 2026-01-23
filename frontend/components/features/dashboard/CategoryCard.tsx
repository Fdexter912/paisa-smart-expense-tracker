'use client'

import { ExpenseStats } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CATEGORY_COLORS } from '@/utils/constants';

interface CategoryChartProps {
  stats: ExpenseStats | null;
}

export const CategoryChart = ({ stats }: CategoryChartProps) => {
  if (!stats || stats.categoryBreakdown.length === 0) return null;

  const data = stats.categoryBreakdown.map(item => ({
    name: item.category,
    value: item.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.name}: $${entry.value.toFixed(2)}`}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};