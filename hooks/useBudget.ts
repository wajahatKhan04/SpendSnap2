"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { currentMonthYear } from "@/lib/date";
import {
  calculateBudgetPercentage,
  calculateBudgetRemaining,
} from "@/lib/calculations";
import type { BudgetSummary } from "@/types";

export function useBudget(): { summary: BudgetSummary; loading: boolean } {
  const { profile, loading: authLoading } = useAuth();
  const { lists, loading: listsLoading } = useShoppingLists();

  const summary = useMemo<BudgetSummary>(() => {
    const { month, year } = currentMonthYear();
    const monthlyBudget = profile?.monthlyBudget ?? 0;

    const currentMonthLists = lists.filter((l) => l.month === month && l.year === year);
    const plannedSpending = currentMonthLists.reduce((sum, l) => sum + l.plannedTotal, 0);
    const actualSpending = currentMonthLists.reduce((sum, l) => sum + l.actualTotal, 0);

    return {
      monthlyBudget,
      plannedSpending,
      actualSpending,
      remainingBudget: calculateBudgetRemaining(monthlyBudget, actualSpending),
      budgetUsagePercentage: calculateBudgetPercentage(monthlyBudget, actualSpending),
    };
  }, [profile, lists]);

  return { summary, loading: authLoading || listsLoading };
}
