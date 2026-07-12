import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { Currency } from "@/types";

interface PriceBadgeProps {
  planned: number;
  actual: number;
  currency?: Currency;
}

export function PriceBadge({ planned, actual, currency = Currency.PKR }: PriceBadgeProps) {
  const diff = actual - planned;
  const percent = planned > 0 ? (diff / planned) * 100 : 0;

  if (actual === 0 || diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Minus className="h-3 w-3" /> No difference
      </span>
    );
  }

  const isHigher = diff > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
        isHigher ? "text-danger" : "text-success"
      )}
    >
      {isHigher ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {isHigher ? "+" : ""}
      {formatCurrency(diff, currency)} ({isHigher ? "+" : ""}
      {percent.toFixed(0)}%)
    </span>
  );
}
