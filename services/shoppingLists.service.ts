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
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { COLLECTIONS } from "@/constants";
import { docToRecord } from "@/lib/firestore-helpers";
import { ListStatus, type ShoppingList } from "@/types";

const listsCollection = (userId: string) =>
  collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.SHOPPING_LISTS);

/** Subscribes to a single shopping list document in real time. */
export function subscribeToShoppingList(
  userId: string,
  listId: string,
  onChange: (list: ShoppingList | null) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  return onSnapshot(
    doc(listsCollection(userId), listId),
    (snapshot) => {
      onChange(snapshot.exists() ? docToRecord<ShoppingList>(snapshot.id, snapshot.data()) : null);
    },
    onError
  );
}

export async function getShoppingList(userId: string, listId: string): Promise<ShoppingList | null> {
  const snapshot = await getDoc(doc(listsCollection(userId), listId));
  return snapshot.exists() ? docToRecord<ShoppingList>(snapshot.id, snapshot.data()) : null;
}

export async function getMostRecentList(userId: string): Promise<ShoppingList | null> {
  const q = query(listsCollection(userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const first = snapshot.docs[0];
  return first ? docToRecord<ShoppingList>(first.id, first.data()) : null;
}

/** Subscribes to a user's shopping lists in real time, newest first. */
export function subscribeToShoppingLists(
  userId: string,
  onChange: (lists: ShoppingList[]) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  const q = query(listsCollection(userId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const lists = snapshot.docs.map((d) => docToRecord<ShoppingList>(d.id, d.data()));
      onChange(lists);
    },
    onError
  );
}

export function subscribeToActiveShoppingLists(
  userId: string,
  onChange: (lists: ShoppingList[]) => void,
  onError: (error: unknown) => void
): Unsubscribe {
  const q = query(
    listsCollection(userId),
    where("status", "==", ListStatus.ACTIVE),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const lists = snapshot.docs.map((d) => docToRecord<ShoppingList>(d.id, d.data()));
      onChange(lists);
    },
    onError
  );
}

export async function createShoppingList(
  userId: string,
  input: { title: string; month: number; year: number }
): Promise<string> {
  const docRef = await addDoc(listsCollection(userId), {
    userId,
    title: input.title,
    month: input.month,
    year: input.year,
    status: ListStatus.ACTIVE,
    plannedTotal: 0,
    actualTotal: 0,
    remainingBudget: 0,
    completedItems: 0,
    totalItems: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateShoppingList(
  userId: string,
  listId: string,
  updates: Partial<ShoppingList>
): Promise<void> {
  await updateDoc(doc(listsCollection(userId), listId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteShoppingList(userId: string, listId: string): Promise<void> {
  await deleteDoc(doc(listsCollection(userId), listId));
}

export async function archiveShoppingList(userId: string, listId: string): Promise<void> {
  await updateShoppingList(userId, listId, { status: ListStatus.ARCHIVED });
}

/** Creates a new list for the target month/year and copies items from the source list, per spec section 59. */
export async function duplicateShoppingList(
  userId: string,
  sourceListId: string,
  target: { title: string; month: number; year: number }
): Promise<string> {
  const { copyItemsToNewList } = await import("@/services/shoppingItems.service");
  const newListId = await createShoppingList(userId, target);
  await copyItemsToNewList(userId, sourceListId, newListId);
  return newListId;
}
