"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToShoppingLists } from "@/services/shoppingLists.service";
import { toFriendlyError } from "@/lib/errors";
import type { ShoppingList } from "@/types";

interface UseShoppingListsResult {
  lists: ShoppingList[];
  loading: boolean;
  error: string | null;
}

export function useShoppingLists(): UseShoppingListsResult {
  const { firebaseUser } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToShoppingLists(
      firebaseUser.uid,
      (data) => {
        setLists(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(toFriendlyError(err));
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [firebaseUser]);

  return { lists, loading, error };
}
