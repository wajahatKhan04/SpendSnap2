import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { ShoppingList } from "@/types";
import { Currency } from "@/types";

interface BudgetProgressProps {
  list: ShoppingList;
  difference: number;
  completionRate: number;
  currency?: Currency;
}

export function BudgetProgress({ list, difference, completionRate, currency = Currency.PKR }: BudgetProgressProps) {
  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Row label="Planned total" value={formatCurrency(list.plannedTotal, currency)} />
        <Row label="Actual total" value={formatCurrency(list.actualTotal, currency)} />
        <Row
          label="Difference"
          value={`${difference > 0 ? "+" : ""}${formatCurrency(difference, currency)}`}
          valueClassName={difference > 0 ? "text-danger" : difference < 0 ? "text-success" : undefined}
        />

        <div>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="tabular-nums font-medium">{completionRate.toFixed(0)}%</span>
          </div>
          <Progress value={completionRate} />
        </div>

        <div className="mt-1 text-xs text-muted-foreground">
          {list.completedItems} of {list.totalItems} items bought
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular-nums font-medium", valueClassName)}>{value}</span>
    </div>
  );
}
