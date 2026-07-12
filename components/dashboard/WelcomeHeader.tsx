"use client";

import { Plus, Copy, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface WelcomeHeaderProps {
  onCreateList: () => void;
  onCopyPreviousMonth: () => void;
  copying?: boolean;
}

export function WelcomeHeader({ onCreateList, onCopyPreviousMonth, copying }: WelcomeHeaderProps) {
  const { profile, firebaseUser } = useAuth();
  const firstName = (profile?.displayName ?? firebaseUser?.displayName ?? "there").split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-h1">{greeting()}, {firstName}</h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onCopyPreviousMonth} disabled={copying}>
          <Copy className="h-4 w-4" />
          {copying ? "Copying…" : "Copy previous month"}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/shopping-lists">
            <Download className="h-4 w-4" />
            Export report
          </Link>
        </Button>
        <Button size="sm" onClick={onCreateList}>
          <Plus className="h-4 w-4" />
          New list
        </Button>
      </div>
    </div>
  );
}
