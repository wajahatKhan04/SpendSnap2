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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userProfile = await getUserDocument(user.uid);
          setProfile(userProfile);
        } catch (error) {
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
    try {
      const { firebaseUser: user, profile: userProfile } = await signInWithGoogle();
      setFirebaseUser(user);
      setProfile(userProfile);
    } catch (error) {
      throw new Error(toFriendlyError(error));
    }
  }

  async function signOut() {
    await signOutUser();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, signIn, signOut }}>
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