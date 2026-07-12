"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageTransition } from "@/components/shared/PageTransition";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { isFirebaseConfigured } from "@/firebase/config";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isFirebaseConfigured && !firebaseUser) {
      router.replace("/login");
    }
  }, [loading, firebaseUser, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // While Firebase isn't configured yet, render the shell anyway so the UI
  // can be built and previewed end-to-end before a project is connected.
  if (isFirebaseConfigured && !firebaseUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <TopNavbar />
        <main className="flex-1 px-4 pb-20 pt-6 lg:px-8 lg:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
