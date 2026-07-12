import { Timestamp } from "firebase/firestore";

/**
 * Firestore returns `serverTimestamp()` fields as `Timestamp` instances, not
 * strings — even though our domain types declare them as ISO strings for
 * simplicity everywhere else in the app. Every place that maps a Firestore
 * snapshot to one of our types must run the raw data through this first, or
 * anything that touches `createdAt`/`updatedAt` (sorting, date formatting)
 * will throw at runtime the first time it hits a real Timestamp object.
 *
 * Also handles the moment right after a write: while a `serverTimestamp()`
 * write is still pending locally, Firestore reports the field as `null` —
 * so we fall back to "now" rather than leaving it unset.
 */
export function normalizeTimestamps<T extends object>(data: T): T {
  const result: Record<string, unknown> = { ...data } as Record<string, unknown>;

  for (const key of Object.keys(result)) {
    const value = result[key];
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else if (value === null && (key === "createdAt" || key === "updatedAt" || key === "lastLogin")) {
      result[key] = new Date().toISOString();
    }
  }

  return result as T;
}

/** Convenience wrapper for the common `{ id: doc.id, ...doc.data() }` pattern. */
export function docToRecord<T extends object>(id: string, data: Record<string, unknown>): T {
  return { id, ...normalizeTimestamps(data) } as unknown as T;
}
