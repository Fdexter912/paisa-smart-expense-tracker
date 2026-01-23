'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseSchema, type ExpenseFormData } from '@/utils/validators';
import { ApiService } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES, CATEGORY_ICONS } from '@/utils/constants';
import { Sparkles } from 'lucide-react';
import { Expense } from '@/types/api.types';
import { cn } from '@/lib/utils';

interface ExpenseFormProps {
  expense?: Expense;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ExpenseForm = ({ expense, onSuccess, onCancel }: ExpenseFormProps) => {
  const [selectedCategory, setSelectedCategory] = useState(expense?.category || '');
  const [aiLoading, setAiLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense || {
      date: new Date().toISOString().split('T')[0],
      category: '',
    },
  });

  const description = watch('description');

  const createMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => ApiService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      onSuccess?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => ApiService.updateExpense(expense!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      onSuccess?.();
    },
  });

  const handleAISuggest = async () => {
    if (!description || description.trim().length === 0) return;

    setAiLoading(true);
    try {
      const result = await ApiService.getSuggestedCategory(description);
      setSelectedCategory(result.category);
      setValue('category', result.category);
      setValue('aiSuggested', true);
    } catch (error) {
      console.error('AI suggestion failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setValue('category', category);
  };

  const onSubmit = (data: ExpenseFormData) => {
    const submitData = {
      ...data,
      category: selectedCategory, // Use selected category
    };

    if (expense) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Lunch at McDonald's"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Category</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAISuggest}
                disabled={aiLoading || !description}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {aiLoading ? 'AI...' : 'AI'}
              </Button>
            </div>
            
            {/* Hidden input for form validation */}
            <input type="hidden" {...register('category')} value={selectedCategory} />
            
            {/* Category Buttons Grid */}
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105",
                    selectedCategory === category
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl mb-1">{CATEGORY_ICONS[category]}</span>
                  <span className="text-xs font-medium">{category}</span>
                </button>
              ))}
            </div>
            
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};