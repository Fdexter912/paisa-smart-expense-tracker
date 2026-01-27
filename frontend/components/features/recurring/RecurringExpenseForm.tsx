'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringExpenseSchema, type RecurringExpenseFormData } from '@/utils/validators';
import { ApiService } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES, FREQUENCIES, CATEGORY_ICONS } from '@/utils/constants';
import { Sparkles, Loader2 } from 'lucide-react';
import { RecurringExpense } from '@/types/api.types';
import { cn } from '@/lib/utils';

interface RecurringExpenseFormProps {
  expense?: RecurringExpense;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RecurringExpenseForm = ({ expense, onSuccess, onCancel }: RecurringExpenseFormProps) => {
  const [selectedCategory, setSelectedCategory] = useState(expense?.category || '');
  const [selectedFrequency, setSelectedFrequency] = useState<any>(expense?.frequency || 'monthly');
  const [aiLoading, setAiLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecurringExpenseFormData>({
    resolver: zodResolver(recurringExpenseSchema),
    defaultValues: expense || {
      templateName: '', // ✅ Changed from 'name'
      amount: 0,
      description: '',
      category: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true,
      autoGenerate: true,
      reminderDays: 0, // ✅ Added
    },
  });

  const description = watch('description');

  useEffect(() => {
    if (expense) {
      setSelectedCategory(expense.category);
      setSelectedFrequency(expense.frequency);
      setValue('category', expense.category);
      setValue('frequency', expense.frequency);
    }
  }, [expense, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: RecurringExpenseFormData) => {
      console.log('📤 Sending to backend:', data);
      return ApiService.createRecurringExpense(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('❌ Error:', error.response?.data);
      const errorMsg = error.response?.data?.details 
        ? error.response.data.details.join(', ')
        : error.response?.data?.message || error.message;
      alert(`Error: ${errorMsg}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RecurringExpenseFormData) => 
      ApiService.updateRecurringExpense(expense!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('❌ Error:', error.response?.data);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleAISuggest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!description?.trim()) return;

    setAiLoading(true);
    try {
      const result = await ApiService.getSuggestedCategory(description);
      setSelectedCategory(result.category);
      setValue('category', result.category);
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

  const handleFrequencySelect = (frequency: string) => {
    setSelectedFrequency(frequency);
    setValue('frequency', frequency as any);
  };

  const onSubmit = (data: RecurringExpenseFormData) => {
    const submitData = {
      ...data,
      category: selectedCategory,
      frequency: selectedFrequency,
      endDate: data.endDate && data.endDate.trim() ? data.endDate : undefined,
      reminderDays: data.reminderDays || 0, // ✅ Default to 0
    };

    console.log('📋 Submitting:', submitData);

    if (!submitData.category) {
      alert('Please select a category');
      return;
    }

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
        <CardTitle>
          {expense ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name *</Label>
            <Input
              id="templateName"
              placeholder="e.g., Netflix Subscription"
              {...register('templateName')} // ✅ Changed from 'name'
            />
            {errors.templateName && (
              <p className="text-sm text-destructive">{errors.templateName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
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
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Monthly streaming service"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Category *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAISuggest}
                disabled={aiLoading || !description}
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI
              </Button>
            </div>
            
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
            <Label>Frequency *</Label>
            <div className="grid grid-cols-5 gap-2">
              {FREQUENCIES.map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => handleFrequencySelect(freq.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105",
                    selectedFrequency === freq.value
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  <span className="text-xl mb-1">{freq.icon}</span>
                  <span className="text-xs font-medium text-center">{freq.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderDays">Reminder Days Before (Optional)</Label>
            <Input
              id="reminderDays"
              type="number"
              min="0"
              max="30"
              placeholder="0"
              {...register('reminderDays', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Get reminded 0-30 days before the expense
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={true}
                {...register('isActive')}
                className="w-4 h-4"
              />
              <span className="text-sm">Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={true}
                {...register('autoGenerate')}
                className="w-4 h-4"
              />
              <span className="text-sm">Auto-generate</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="flex-1"
              disabled={isLoading || !selectedCategory}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                expense ? 'Update' : 'Create'
              )}
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