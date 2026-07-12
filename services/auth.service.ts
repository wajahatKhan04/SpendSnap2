// import {
//   signInWithPopup,
//   signOut as firebaseSignOut,
//   type User as FirebaseUser,
// } from "firebase/auth";
// import {
//   doc,
//   getDoc,
//   serverTimestamp,
//   setDoc,
//   updateDoc,
// } from "firebase/firestore";
// import { auth, db, googleProvider } from "@/firebase/config";
// import { COLLECTIONS } from "@/constants";
// import { normalizeTimestamps } from "@/lib/firestore-helpers";
// import { Currency, ThemePreference, type User } from "@/types";

// /** Opens the Google sign-in popup and ensures a matching Firestore user document exists. */
// export async function signInWithGoogle(): Promise<FirebaseUser> {
//   const credential = await signInWithPopup(auth, googleProvider);
//   await ensureUserDocument(credential.user);
//   return credential.user;
// }

// export async function signOutUser(): Promise<void> {
//   await firebaseSignOut(auth);
// }

// /** Creates the user's Firestore profile on first login; updates lastLogin otherwise. */
// export async function ensureUserDocument(firebaseUser: FirebaseUser): Promise<User> {
//   const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
//   const snapshot = await getDoc(userRef);

//   if (!snapshot.exists()) {
//     const now = new Date().toISOString();
//     const newUser = {
//       id: firebaseUser.uid,
//       email: firebaseUser.email ?? "",
//       displayName: firebaseUser.displayName ?? "SpendSnap User",
//       photoURL: firebaseUser.photoURL,
//       monthlyBudget: 0,
//       currency: Currency.PKR,
//       theme: ThemePreference.SYSTEM,
//       language: "en",
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//       lastLogin: serverTimestamp(),
//     };
//     await setDoc(userRef, newUser);
//     return { ...newUser, createdAt: now, updatedAt: now, lastLogin: now } as User;
//   }

//   await updateDoc(userRef, { lastLogin: serverTimestamp() });
//   return normalizeTimestamps<User>(snapshot.data() as User);
// }

// export async function getUserDocument(uid: string): Promise<User | null> {
//   const snapshot = await getDoc(doc(db, COLLECTIONS.USERS, uid));
//   return snapshot.exists() ? normalizeTimestamps<User>(snapshot.data() as User) : null;
// }









import {
  getRedirectResult,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/firebase/config";
import { COLLECTIONS } from "@/constants";
import { normalizeTimestamps } from "@/lib/firestore-helpers";
import { Currency, ThemePreference, type User } from "@/types";

/**
 * Redirect-based sign-in instead of a popup. Popups depend on third-party
 * cookies and cross-window messaging that modern browsers (real Chrome with
 * default privacy settings especially) increasingly block or silently fail
 * — that's what was happening here. Redirect flow navigates the whole tab to
 * Google and back, which works reliably everywhere. The result is picked up
 * by `resolveRedirectSignIn()` below, called once on app load.
 */
export async function signInWithGoogle(): Promise<void> {
  await signInWithRedirect(auth, googleProvider);
}

/**
 * Call once when the app loads (in AuthProvider). If the user just came back
 * from the Google redirect, this resolves with their credential and ensures
 * their Firestore profile exists. Returns null on a normal page load with no
 * pending redirect.
 */
export async function resolveRedirectSignIn(): Promise<FirebaseUser | null> {
  const result = await getRedirectResult(auth);
  if (!result) return null;
  await ensureUserDocument(result.user);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Creates the user's Firestore profile on first login; updates lastLogin otherwise. */
export async function ensureUserDocument(firebaseUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const now = new Date().toISOString();
    const newUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email ?? "",
      displayName: firebaseUser.displayName ?? "SpendSnap User",
      photoURL: firebaseUser.photoURL,
      monthlyBudget: 0,
      currency: Currency.PKR,
      theme: ThemePreference.SYSTEM,
      language: "en",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };

    await setDoc(userRef, newUser);
    return { ...newUser, createdAt: now, updatedAt: now, lastLogin: now } as User;
  }

  await updateDoc(userRef, { lastLogin: serverTimestamp() });
  return normalizeTimestamps<User>(snapshot.data() as User);
}

export async function getUserDocument(uid: string): Promise<User | null> {
  const snapshot = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snapshot.exists() ? normalizeTimestamps<User>(snapshot.data() as User) : null;
}
