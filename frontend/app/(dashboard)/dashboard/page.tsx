'use client'

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api.service';
import { Expense } from '@/types/api.types';
import { StatsCards } from '@/components/features/dashboard/StatsCards';
import { CategoryChart } from '@/components/features/dashboard/CategoryCard';
import { BarChartComponent } from '@/components/features/dashboard/BarChartComponent';
import { ExpenseForm } from '@/components/features/expenses/ExpenseForm';
import { ExpenseList } from '@/components/features/expenses/ExpenseList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const queryClient = useQueryClient();

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => ApiService.getExpenses({ limit: 100 }),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => ApiService.getExpenseStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExpense(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingExpense(undefined);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Stats Cards Section */}
        <div className="space-y-4">
          <StatsCards stats={stats || null} />
        </div>

        {/* Charts Section */}
        {stats && stats.categoryBreakdown.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart stats={stats} />
            <BarChartComponent stats={stats} />
          </div>
        )}

        {/* Add Expense Button - Sticky on mobile */}
        <div className="sticky top-20 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent">
          <Button
            onClick={() => {
              setEditingExpense(undefined);
              setShowForm(!showForm);
            }}
            size="lg"
            className="w-full md:w-auto shadow-lg"
          >
            {showForm ? (
              <>
                <X className="h-5 w-5 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Add New Expense
              </>
            )}
          </Button>
        </div>

        {/* Expense Form */}
        {showForm && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <ExpenseForm
              expense={editingExpense}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {/* Recent Expenses Section */}
        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Recent Expenses</CardTitle>
            <p className="text-sm text-muted-foreground">
              {expensesData?.expenses.length || 0} total expenses
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ExpenseList
              expenses={expensesData?.expenses || []}
              isLoading={expensesLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}