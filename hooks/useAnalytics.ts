"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { getItemsForList } from "@/services/shoppingItems.service";
import { generateInsights } from "@/lib/insights";
import type { ChartData, MonthlyAnalytics, ShoppingItem, SmartInsight, YearlyAnalytics } from "@/types";

interface UseAnalyticsResult {
  monthly: MonthlyAnalytics[];
  yearly: YearlyAnalytics[];
  categoryDistribution: ChartData[];
  insights: SmartInsight[];
  loading: boolean;
}

export function useAnalytics(): UseAnalyticsResult {
  const { firebaseUser, profile } = useAuth();
  const { lists, loading: listsLoading } = useShoppingLists();
  const [allItems, setAllItems] = useState<ShoppingItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser || lists.length === 0) {
      setAllItems([]);
      setItemsLoading(false);
      return;
    }
    let cancelled = false;
    setItemsLoading(true);

    Promise.all(lists.map((list) => getItemsForList(firebaseUser.uid, list.id)))
      .then((results) => {
        if (!cancelled) setAllItems(results.flat());
      })
      .finally(() => {
        if (!cancelled) setItemsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [firebaseUser, lists]);

  const monthly: MonthlyAnalytics[] = [...lists]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((l) => ({ month: l.month, year: l.year, plannedTotal: l.plannedTotal, actualTotal: l.actualTotal }));

  const yearlyMap = new Map<number, YearlyAnalytics>();
  for (const list of lists) {
    const existing = yearlyMap.get(list.year) ?? { year: list.year, totalSpent: 0, monthlyBreakdown: [] };
    existing.totalSpent += list.actualTotal;
    existing.monthlyBreakdown.push({
      month: list.month,
      year: list.year,
      plannedTotal: list.plannedTotal,
      actualTotal: list.actualTotal,
    });
    yearlyMap.set(list.year, existing);
  }
  const yearly = Array.from(yearlyMap.values()).sort((a, b) => a.year - b.year);

  const categoryTotals = new Map<string, number>();
  for (const item of allItems) {
    const key = item.category?.trim() || "Uncategorized";
    categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + item.actualTotal);
  }
  const categoryDistribution: ChartData[] = Array.from(categoryTotals.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const insights = generateInsights(lists, profile?.currency);

  return {
    monthly,
    yearly,
    categoryDistribution,
    insights,
    loading: listsLoading || itemsLoading,
  };
}
