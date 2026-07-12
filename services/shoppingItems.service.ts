import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { COLLECTIONS } from "@/constants";
import { calculateItemTotal, calculateListTotal } from "@/lib/calculations";
import { docToRecord, normalizeTimestamps } from "@/lib/firestore-helpers";
import { ItemStatus, type ShoppingItem } from "@/types";

const listDocRef = (userId: string, listId: string) =>
  doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.SHOPPING_LISTS, listId);

const itemsCollection = (userId: string, listId: string) =>
  collection(listDocRef(userId, listId), COLLECTIONS.ITEMS);

const priceHistoryCollection = (userId: string, listId: string, itemId: string) =>
  collection(listDocRef(userId, listId), COLLECTIONS.ITEMS, itemId, COLLECTIONS.PRICE_HISTORY);

export async function getItemsForList(userId: string, listId: string): Promise<ShoppingItem[]> {
  const snapshot = await getDocs(itemsCollection(userId, listId));
  return snapshot.docs.map((d) => docToRecord<ShoppingItem>(d.id, d.data()));
}

export function subscribeToItems(
  userId: string,
  listId: string,
  onChange: (items: ShoppingItem[]) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  const q = query(itemsCollection(userId, listId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      onChange(snapshot.docs.map((d) => docToRecord<ShoppingItem>(d.id, d.data())));
    },
    onError
  );
}

export interface ItemInput {
  name: string;
  quantity: number;
  unit: ShoppingItem["unit"];
  plannedUnitPrice: number;
  actualUnitPrice: number;
  category: string;
  notes: string;
  status: ItemStatus;
}

export async function addItem(userId: string, listId: string, input: ItemInput): Promise<void> {
  const plannedTotal = calculateItemTotal(input.quantity, input.plannedUnitPrice);
  const actualTotal = calculateItemTotal(input.quantity, input.actualUnitPrice);

  await addDoc(itemsCollection(userId, listId), {
    listId,
    name: input.name,
    quantity: input.quantity,
    unit: input.unit,
    plannedUnitPrice: input.plannedUnitPrice,
    actualUnitPrice: input.actualUnitPrice,
    plannedTotal,
    actualTotal,
    difference: actualTotal - plannedTotal,
    status: input.status,
    notes: input.notes,
    category: input.category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await recalculateListTotals(userId, listId);
}

/**
 * Updates an item and, when the actual unit price changed, records the old
 * price into that item's priceHistory subcollection before overwriting it.
 */
export async function updateItem(
  userId: string,
  listId: string,
  itemId: string,
  input: ItemInput
): Promise<void> {
  const itemRef = doc(itemsCollection(userId, listId), itemId);
  const existingSnap = await getDoc(itemRef);
  const existing = existingSnap.exists() ? normalizeTimestamps<ShoppingItem>(existingSnap.data() as ShoppingItem) : null;

  const plannedTotal = calculateItemTotal(input.quantity, input.plannedUnitPrice);
  const actualTotal = calculateItemTotal(input.quantity, input.actualUnitPrice);

  if (existing && existing.actualUnitPrice !== input.actualUnitPrice && input.actualUnitPrice > 0) {
    const now = new Date();
    await addDoc(priceHistoryCollection(userId, listId, itemId), {
      itemId,
      price: input.actualUnitPrice,
      date: now.toISOString(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
  }

  await updateDoc(itemRef, {
    name: input.name,
    quantity: input.quantity,
    unit: input.unit,
    plannedUnitPrice: input.plannedUnitPrice,
    actualUnitPrice: input.actualUnitPrice,
    plannedTotal,
    actualTotal,
    difference: actualTotal - plannedTotal,
    status: input.status,
    notes: input.notes,
    category: input.category,
    updatedAt: serverTimestamp(),
  });

  await recalculateListTotals(userId, listId);
}

export async function updateItemStatus(userId: string, listId: string, itemId: string, status: ItemStatus): Promise<void> {
  await updateDoc(doc(itemsCollection(userId, listId), itemId), { status, updatedAt: serverTimestamp() });
  await recalculateListTotals(userId, listId);
}

export async function deleteItem(userId: string, listId: string, itemId: string): Promise<void> {
  await deleteDoc(doc(itemsCollection(userId, listId), itemId));
  await recalculateListTotals(userId, listId);
}

/** Recomputes and writes back the parent list's aggregate totals. Called after every item mutation. */
export async function recalculateListTotals(userId: string, listId: string): Promise<void> {
  const snapshot = await getDocs(itemsCollection(userId, listId));
  const items = snapshot.docs.map((d) => normalizeTimestamps<ShoppingItem>(d.data() as ShoppingItem));

  const plannedTotal = calculateListTotal(items, "plannedTotal");
  const actualTotal = calculateListTotal(items, "actualTotal");
  const completedItems = items.filter((i) => i.status === ItemStatus.BOUGHT).length;

  await runTransaction(db, async (transaction) => {
    transaction.update(listDocRef(userId, listId), {
      plannedTotal,
      actualTotal,
      totalItems: items.length,
      completedItems,
      updatedAt: serverTimestamp(),
    });
  });
}

/** Copies every item from a source list into a newly created target list, resetting actuals per spec. */
export async function copyItemsToNewList(
  userId: string,
  sourceListId: string,
  targetListId: string
): Promise<void> {
  const snapshot = await getDocs(itemsCollection(userId, sourceListId));
  const sourceItems = snapshot.docs.map((d) => normalizeTimestamps<ShoppingItem>(d.data() as ShoppingItem));

  await Promise.all(
    sourceItems.map((item) =>
      addItem(userId, targetListId, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        plannedUnitPrice: item.plannedUnitPrice,
        actualUnitPrice: 0,
        category: item.category,
        notes: "",
        status: ItemStatus.NOT_BOUGHT,
      })
    )
  );
}
