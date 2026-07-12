"use client";

import { useState } from "react";
import { Wallet, PiggyBank, ShoppingCart, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { BudgetCard } from "@/components/dashboard/BudgetCard";
import { BudgetRing } from "@/components/dashboard/BudgetRing";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { RecentLists } from "@/components/dashboard/RecentLists";
import { CreateListDialog } from "@/components/shopping/CreateListDialog";
import { useAuth } from "@/hooks/useAuth";
import { useBudget } from "@/hooks/useBudget";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/lib/currency";
import { calculateSavings } from "@/lib/calculations";
import { currentMonthYear } from "@/lib/date";
import { toFriendlyError } from "@/lib/errors";
import { duplicateShoppingList, getMostRecentList } from "@/services/shoppingLists.service";
import { Currency } from "@/types";

export default function DashboardPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const { profile, firebaseUser } = useAuth();
  const { summary } = useBudget();
  const { lists } = useShoppingLists();
  const { monthly, insights } = useAnalytics();
  const currency = profile?.currency ?? Currency.PKR;
  const savings = calculateSavings(summary.plannedSpending, summary.actualSpending);

  async function handleCopyPreviousMonth() {
    if (!firebaseUser) return;
    setCopying(true);
    try {
      const previous = await getMostRecentList(firebaseUser.uid);
      if (!previous) {
        toast.error("No previous list found to copy from.");
        return;
      }
      const { month, year } = currentMonthYear();
      await duplicateShoppingList(firebaseUser.uid, previous.id, {
        title: `${previous.title} (Copy)`,
        month,
        year,
      });
      toast.success("Previous month copied into a new list.");
    } catch (err) {
      toast.error(toFriendlyError(err));
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <WelcomeHeader onCreateList={() => setCreateOpen(true)} onCopyPreviousMonth={handleCopyPreviousMonth} copying={copying} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BudgetCard icon={Wallet} label="Monthly budget" value={formatCurrency(summary.monthlyBudget, currency)} accent="primary" />
        <BudgetCard icon={ShoppingCart} label="Planned spending" value={formatCurrency(summary.plannedSpending, currency)} accent="secondary" />
        <BudgetCard icon={TrendingDown} label="Actual spending" value={formatCurrency(summary.actualSpending, currency)} accent="accent" />
        <BudgetCard
          icon={PiggyBank}
          label="Remaining budget"
          value={formatCurrency(summary.remainingBudget, currency)}
          changeLabel={savings >= 0 ? `Saved ${formatCurrency(savings, currency)}` : `Over by ${formatCurrency(Math.abs(savings), currency)}`}
          changeTone={savings >= 0 ? "positive" : "negative"}
          accent={summary.remainingBudget < 0 ? "danger" : "primary"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <BudgetRing summary={summary} currency={currency} />
        </div>
        <div className="lg:col-span-2">
          <MonthlyChart data={monthly} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentLists lists={lists} currency={currency} onCreateList={() => setCreateOpen(true)} />
        </div>
        <div className="lg:col-span-1">
          <InsightsCard insights={insights} />
        </div>
      </div>

      <CreateListDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
