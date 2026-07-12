import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateMonthlyTrend } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { YearlyAnalytics } from "@/types";
import { Currency } from "@/types";

export function TrendCard({ yearly, currency = Currency.PKR }: { yearly: YearlyAnalytics[]; currency?: Currency }) {
  const sorted = [...yearly].sort((a, b) => b.year - a.year);
  const current = sorted[0];
  const previous = sorted[1];

  if (!current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Year over year</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Not enough data yet to compare years.</p>
        </CardContent>
      </Card>
    );
  }

  const change = previous ? calculateMonthlyTrend(previous.totalSpent, current.totalSpent) : 0;
  const isUp = change > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Year over year</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{current.year}</span>
          <span className="tabular-nums font-semibold">{formatCurrency(current.totalSpent, currency)}</span>
        </div>
        {previous && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{previous.year}</span>
            <span className="tabular-nums font-semibold">{formatCurrency(previous.totalSpent, currency)}</span>
          </div>
        )}
        {previous && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium",
              isUp ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"
            )}
          >
            {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(change).toFixed(0)}% {isUp ? "increase" : "decrease"} vs. {previous.year}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
