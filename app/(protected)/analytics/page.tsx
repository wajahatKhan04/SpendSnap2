"use client";

import { BarChart } from "@/components/analytics/BarChart";
import { PlannedVsActualChart, SpendingTrendChart } from "@/components/analytics/LineChart";
import { PieChart } from "@/components/analytics/PieChart";
import { TrendCard } from "@/components/analytics/TrendCard";
import { BudgetRing } from "@/components/dashboard/BudgetRing";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { useBudget } from "@/hooks/useBudget";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const { monthly, yearly, categoryDistribution, insights, loading } = useAnalytics();
  const { summary } = useBudget();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deeper insight into your spending over time.</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : monthly.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No data available yet."
          description="Create a shopping list and add a few items — your charts will appear here automatically."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <BudgetRing summary={summary} currency={profile?.currency} />
            </div>
            <div className="lg:col-span-2">
              <SpendingTrendChart data={monthly} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BarChart data={monthly} />
            <PlannedVsActualChart data={monthly} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PieChart data={categoryDistribution} />
            </div>
            <div className="flex flex-col gap-4">
              <TrendCard yearly={yearly} currency={profile?.currency} />
            </div>
          </div>

          <InsightsCard insights={insights} />
        </>
      )}
    </div>
  );
}
