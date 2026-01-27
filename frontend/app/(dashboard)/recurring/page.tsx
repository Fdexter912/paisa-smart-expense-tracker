'use client'

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api.service';
import { RecurringExpense } from '@/types/api.types';
import { RecurringStatsCards } from '@/components/features/recurring/RecurringStatsCards';
import { RecurringExpenseForm } from '@/components/features/recurring/RecurringExpenseForm';
import { RecurringExpenseList } from '@/components/features/recurring/RecurringExpenseList';
import { UpcomingRecurring } from '@/components/features/recurring/UpcomingRecurring';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

export default function RecurringExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | undefined>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['recurring-expenses'],
    queryFn: () => ApiService.getRecurringExpenses(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteRecurringExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-recurring'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      ApiService.updateRecurringExpense(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-recurring'] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: (id: string) => ApiService.generateRecurringExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      alert('Expense generated successfully!');
    },
  });

  const handleEdit = (expense: RecurringExpense) => {
    setEditingExpense(expense);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive });
  };

  const handleGenerate = (id: string) => {
    if (window.confirm('Generate an expense from this template now?')) {
      generateMutation.mutate(id);
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
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recurring Expenses</h1>
            <p className="text-muted-foreground mt-1">
              Automate your regular expenses
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <RecurringStatsCards data={data || null} />

        {/* Upcoming Expenses */}
        <UpcomingRecurring />

        {/* Add Button */}
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
                Add Recurring Expense
              </>
            )}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <RecurringExpenseForm
              expense={editingExpense}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {/* List */}
        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">All Recurring Expenses</CardTitle>
            <p className="text-sm text-muted-foreground">
              {data?.recurringExpenses.length || 0} recurring expenses configured
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <RecurringExpenseList
              expenses={data?.recurringExpenses || []}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onGenerate={handleGenerate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}