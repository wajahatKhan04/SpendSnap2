"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Receipt } from "lucide-react";
import { SIDEBAR_NAV_ITEMS, APP_NAME } from "@/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-primary-foreground">
          <Receipt className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-subtle text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
