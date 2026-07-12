import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { COLLECTIONS } from "@/constants";
import type { Currency, ThemePreference } from "@/types";

export async function updateUserProfile(
  uid: string,
  updates: Partial<{
    displayName: string;
    monthlyBudget: number;
    currency: Currency;
    theme: ThemePreference;
    language: string;
  }>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), updates);
}
