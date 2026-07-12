"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToShoppingList } from "@/services/shoppingLists.service";
import { subscribeToItems } from "@/services/shoppingItems.service";
import { toFriendlyError } from "@/lib/errors";
import { calculateBudgetRemaining, calculateCompletionRate, calculateDifference } from "@/lib/calculations";
import type { ShoppingItem, ShoppingList } from "@/types";

interface UseShoppingListResult {
  list: ShoppingList | null;
  items: ShoppingItem[];
  loading: boolean;
  error: string | null;
  summary: {
    difference: number;
    completionRate: number;
    budgetRemaining: number;
  };
}

export function useShoppingList(listId: string): UseShoppingListResult {
  const { firebaseUser } = useAuth();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser || !listId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubList = subscribeToShoppingList(
      firebaseUser.uid,
      listId,
      (data) => {
        setList(data);
        setLoading(false);
      },
      (err) => {
        setError(toFriendlyError(err));
        setLoading(false);
      }
    );

    const unsubItems = subscribeToItems(
      firebaseUser.uid,
      listId,
      (data) => setItems(data),
      (err) => setError(toFriendlyError(err))
    );

    return () => {
      unsubList();
      unsubItems();
    };
  }, [firebaseUser, listId]);

  const summary = useMemo(() => {
    if (!list) return { difference: 0, completionRate: 0, budgetRemaining: 0 };
    return {
      difference: calculateDifference(list.plannedTotal, list.actualTotal),
      completionRate: calculateCompletionRate(list.completedItems, list.totalItems),
      budgetRemaining: calculateBudgetRemaining(list.plannedTotal, list.actualTotal),
    };
  }, [list]);

  return { list, items, loading, error, summary };
}
