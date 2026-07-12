// "use client";

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   type ReactNode,
// } from "react";
// import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
// import { auth, isFirebaseConfigured } from "@/firebase/config";
// import {
//   ensureUserDocument,
//   getUserDocument,
//   signInWithGoogle,
//   signOutUser,
// } from "@/services/auth.service";
// import { toFriendlyError } from "@/lib/errors";
// import type { User } from "@/types";

// interface AuthContextValue {
//   firebaseUser: FirebaseUser | null;
//   profile: User | null;
//   loading: boolean;
//   signIn: () => Promise<void>;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
//   const [profile, setProfile] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!isFirebaseConfigured) {
//       // No Firebase project connected yet — don't block the whole app on it.
//       setLoading(false);
//       return;
//     }

//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setFirebaseUser(user);
//       if (user) {
//         try {
//           const userProfile = await getUserDocument(user.uid);
//           setProfile(userProfile);
//         } catch (error) {
//           // Never let a Firestore hiccup leave the app stuck on the loading
//           // spinner forever — surface it as a toast-friendly message and
//           // still let the person see the shell (profile stays null; screens
//           // that need it show their own empty/error state).
//           console.error("Failed to load user profile:", toFriendlyError(error));
//           setProfile(null);
//         }
//       } else {
//         setProfile(null);
//       }
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   async function signIn() {
//     try {
//       const user = await signInWithGoogle();
//       const userProfile = await ensureUserDocument(user);
//       setProfile(userProfile);
//     } catch (error) {
//       throw new Error(toFriendlyError(error));
//     }
//   }

//   async function signOut() {
//     await signOutUser();
//     setProfile(null);
//   }

//   return (
//     <AuthContext.Provider value={{ firebaseUser, profile, loading, signIn, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth(): AuthContextValue {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }





"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/firebase/config";
import {
  getUserDocument,
  resolveRedirectSignIn,
  signInWithGoogle,
  signOutUser,
} from "@/services/auth.service";
import { toFriendlyError } from "@/lib/errors";
import type { User } from "@/types";

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signInError: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // No Firebase project connected yet — don't block the whole app on it.
      setLoading(false);
      return;
    }

    // Picks up the result if we just came back from the Google redirect.
    // Runs once; onAuthStateChanged below is what actually drives state
    // going forward (including this same sign-in, once Firebase applies it).
    resolveRedirectSignIn().catch((error) => {
      setSignInError(toFriendlyError(error));
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userProfile = await getUserDocument(user.uid);
          setProfile(userProfile);
        } catch (error) {
          // Never let a Firestore hiccup leave the app stuck on the loading
          // spinner forever — surface it as a toast-friendly message and
          // still let the person see the shell (profile stays null; screens
          // that need it show their own empty/error state).
          console.error("Failed to load user profile:", toFriendlyError(error));
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signIn() {
    setSignInError(null);
    try {
      // Navigates the tab away to Google — this call does not resolve on
      // success. The result comes back via resolveRedirectSignIn() above
      // once the browser returns to this page.
      await signInWithGoogle();
    } catch (error) {
      const message = toFriendlyError(error);
      setSignInError(message);
      throw new Error(message);
    }
  }

  async function signOut() {
    await signOutUser();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, signIn, signOut, signInError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}