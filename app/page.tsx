"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { isFirebaseConfigured } from "@/firebase/config";

export default function RootPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (isFirebaseConfigured && firebaseUser) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [loading, firebaseUser, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
