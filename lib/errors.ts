import { FirebaseError } from "firebase/app";

const MESSAGES: Record<string, string> = {
  "auth/popup-closed-by-user": "Sign-in was cancelled. Give it another try whenever you're ready.",
  "auth/network-request-failed": "We couldn't reach the network. Check your connection and try again.",
  "auth/user-disabled": "This account has been disabled. Contact support if that seems wrong.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "permission-denied": "You don't have permission to do that.",
  "not-found": "We couldn't find what you were looking for.",
  unavailable: "SpendSnap is temporarily unavailable. Please try again shortly.",
  "deadline-exceeded": "That took too long to respond. Please try again.",
};

const FALLBACK = "Something went wrong. Please try again.";

/** Converts any thrown error into a short, user-safe message. Never surfaces raw stack traces. */
export function toFriendlyError(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MESSAGES[error.code] ?? FALLBACK;
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You're offline. Changes will sync once you're back online.";
  }
  return FALLBACK;
}
