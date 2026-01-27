'use client'

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api.service';
import { Budget } from '@/types/api.types';
import { BudgetForm } from '@/components/features/budget/BudgetForm';
import { BudgetList } from '@/components/features/budget/BudgetList';
import { BudgetProgressCard } from '@/components/features/budget/BudgetProgressCard';
import { CurrentBudgetWidget } from '@/components/features/budget/CurrentBudgetWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, ArrowLeft } from 'lucide-react';

export default function BudgetsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [viewingBudgetId, setViewingBudgetId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => ApiService.getBudgets(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['current-budget'] });
    },
  });

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (id: string) => {
    setViewingBudgetId(id);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBudget(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBudget(undefined);
  };

  // If viewing a specific budget's progress
  if (viewingBudgetId) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setViewingBudgetId(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Budgets
            </Button>
          </div>

          <BudgetProgressCard budgetId={viewingBudgetId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Budget Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your spending limits
            </p>
          </div>
        </div>

        {/* Current Budget Widget */}
        <CurrentBudgetWidget />

        {/* Add Button */}
        <div className="sticky top-20 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent">
          <Button
            onClick={() => {
              setEditingBudget(undefined);
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
                Create New Budget
              </>
            )}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <BudgetForm
              budget={editingBudget}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {/* List */}
        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">All Budgets</CardTitle>
            <p className="text-sm text-muted-foreground">
              {budgetsData?.budgets.length || 0} budgets configured
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <BudgetList
              budgets={budgetsData?.budgets || []}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}