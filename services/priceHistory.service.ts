import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import { COLLECTIONS } from "@/constants";
import { calculateAveragePrice } from "@/lib/calculations";
import type { PriceHistoryEntry } from "@/types";

const priceHistoryCollection = (userId: string, listId: string, itemId: string) =>
  collection(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.SHOPPING_LISTS,
    listId,
    COLLECTIONS.ITEMS,
    itemId,
    COLLECTIONS.PRICE_HISTORY
  );

/** Every recorded price change for a single item, oldest first — powers its trend chart. */
export async function getItemPriceHistory(
  userId: string,
  listId: string,
  itemId: string
): Promise<PriceHistoryEntry[]> {
  const q = query(priceHistoryCollection(userId, listId, itemId), orderBy("date", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PriceHistoryEntry);
}

export function summarizePriceHistory(entries: PriceHistoryEntry[]) {
  const prices = entries.map((e) => e.price);
  return {
    highest: prices.length ? Math.max(...prices) : 0,
    lowest: prices.length ? Math.min(...prices) : 0,
    average: calculateAveragePrice(prices),
  };
}
