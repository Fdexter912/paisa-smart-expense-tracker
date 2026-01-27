"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetSchema, type BudgetFormData } from "@/utils/validators";
import { ApiService } from "@/services/api.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CATEGORIES,
  BUDGET_TYPES,
  ALERT_THRESHOLDS,
  CATEGORY_ICONS,
} from "@/utils/constants";
import { Loader2, Plus, Trash2, Bell } from "lucide-react";
import { Budget } from "@/types/api.types";
import { cn } from "@/lib/utils";

interface BudgetFormProps {
  budget?: Budget;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const BudgetForm = ({
  budget,
  onSuccess,
  onCancel,
}: BudgetFormProps) => {
  const [selectedType, setSelectedType] = useState(budget?.type || "monthly");
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget || {
      name: "",
      type: "monthly",
      period: {
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      categoryBudgets: [{ category: "", limit: 0 }],
      alerts: [],
      isActive: true,
    },
  });

  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({
    control,
    name: "categoryBudgets",
  });

  const {
    fields: alertFields,
    append: appendAlert,
    remove: removeAlert,
  } = useFieldArray({
    control,
    name: "alerts",
  });

  const createMutation = useMutation({
    mutationFn: (data: BudgetFormData) => {
      console.log("📤 Creating budget:", data);
      return ApiService.createBudget(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["current-budget"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("❌ Error:", error.response?.data);
      const errorMsg =
        error.response?.data?.details?.join(", ") ||
        error.response?.data?.message ||
        error.message;
      alert(`Error: ${errorMsg}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: BudgetFormData) =>
      ApiService.updateBudget(budget!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["current-budget"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleTypeChange = (type: string) => {
    setSelectedType(type as any);
    setValue("type", type as any);

    const today = new Date();
    if (type === "monthly") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setValue("period.startDate", start.toISOString().split("T")[0]);
      setValue("period.endDate", end.toISOString().split("T")[0]);
    } else if (type === "weekly") {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setValue("period.startDate", start.toISOString().split("T")[0]);
      setValue("period.endDate", end.toISOString().split("T")[0]);
    }
  };

  const handleCategorySelect = (index: number, category: string) => {
    setValue(`categoryBudgets.${index}.category`, category);
  };

  const onSubmit = (data: BudgetFormData) => {
    console.log("📋 Form data:", data);

    if (budget) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{budget ? "Edit Budget" : "Create New Budget"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name *</Label>
            <Input
              id="name"
              placeholder="e.g., January 2025 Budget"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Budget Type *</Label>
            <div className="grid grid-cols-3 gap-2">
              {BUDGET_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
                    selectedType === type.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <span className="text-2xl mb-1">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("period.startDate")}
              />
              {errors.period?.startDate && (
                <p className="text-sm text-destructive">
                  {errors.period.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input id="endDate" type="date" {...register("period.endDate")} />
              {errors.period?.endDate && (
                <p className="text-sm text-destructive">
                  {errors.period.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Category Budgets *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendCategory({ category: "", limit: 0 })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>

            {categoryFields.map((field, index) => {
              const selectedCategory = watch(
                `categoryBudgets.${index}.category`,
              );

              return (
                <div
                  key={field.id}
                  className="space-y-3 p-4 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <Label>Select Category</Label>
                    {categoryFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  {/* Category Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategorySelect(index, cat)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:scale-105",
                          selectedCategory === cat
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border bg-background hover:border-primary/50",
                        )}
                      >
                        <span className="text-2xl mb-1">
                          {CATEGORY_ICONS[cat]}
                        </span>
                        <span className="text-xs font-medium">{cat}</span>
                      </button>
                    ))}
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label>Budget Limit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register(`categoryBudgets.${index}.limit`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  {selectedCategory && (
                    <p className="text-sm text-muted-foreground">
                      Selected:{" "}
                      <span className="font-medium">{selectedCategory}</span>
                    </p>
                  )}
                </div>
              );
            })}

            {errors.categoryBudgets && (
              <p className="text-sm text-destructive">
                {errors.categoryBudgets.message ||
                  "Please add at least one category"}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Budget Alerts (Optional)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendAlert({ category: "", threshold: 80 })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Alert
              </Button>
            </div>

            {alertFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <select
                    {...register(`alerts.${index}.category`)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <select
                    {...register(`alerts.${index}.threshold`, {
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                  >
                    {ALERT_THRESHOLDS.map((threshold) => (
                      <option key={threshold} value={threshold}>
                        {threshold}%
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeAlert(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              defaultChecked={true}
              {...register("isActive")}
              className="w-4 h-4"
            />
            <Label htmlFor="isActive">Active Budget</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : budget ? (
                "Update Budget"
              ) : (
                "Create Budget"
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
