"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBudgetStatus } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { BudgetSummary } from "@/types";
import { Currency } from "@/types";

const STATUS_COLOR: Record<ReturnType<typeof getBudgetStatus>, string> = {
  safe: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

const STATUS_LABEL: Record<ReturnType<typeof getBudgetStatus>, string> = {
  safe: "Healthy",
  warning: "Approaching limit",
  danger: "Over budget",
};

export function BudgetRing({ summary, currency = Currency.PKR }: { summary: BudgetSummary; currency?: Currency }) {
  const status = getBudgetStatus(summary.budgetUsagePercentage);
  const clamped = Math.min(summary.budgetUsagePercentage, 100);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--muted)" strokeWidth="12" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={STATUS_COLOR[status]}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular-nums text-2xl font-semibold">{summary.budgetUsagePercentage.toFixed(0)}%</span>
            <span className={cn("text-xs font-medium", `text-[${STATUS_COLOR[status]}]`)}>{STATUS_LABEL[status]}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-1">
          <div>
            <p className="text-muted-foreground">Monthly budget</p>
            <p className="tabular-nums font-semibold">{formatCurrency(summary.monthlyBudget, currency)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p className="tabular-nums font-semibold">{formatCurrency(summary.remainingBudget, currency)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
