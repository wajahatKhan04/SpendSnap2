import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { LIST_STATUS_LABELS } from "@/constants";
import { calculateCompletionRate } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currency";
import { formatMonthYear } from "@/lib/date";
import type { ShoppingList } from "@/types";
import { Currency, ListStatus } from "@/types";

const STATUS_VARIANT: Record<ListStatus, "success" | "secondary" | "muted"> = {
  [ListStatus.ACTIVE]: "success",
  [ListStatus.COMPLETED]: "secondary",
  [ListStatus.ARCHIVED]: "muted",
};

export function RecentLists({
  lists,
  currency = Currency.PKR,
  onCreateList,
}: {
  lists: ShoppingList[];
  currency?: Currency;
  onCreateList: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent shopping lists</CardTitle>
      </CardHeader>
      <CardContent>
        {lists.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No shopping lists yet."
            description="Create your first list to start planning this month's groceries."
            actionLabel="Create shopping list"
            onAction={onCreateList}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {lists.slice(0, 5).map((list) => {
              const completion = calculateCompletionRate(list.completedItems, list.totalItems);
              return (
                <li key={list.id}>
                  <Link
                    href={`/shopping-lists/${list.id}`}
                    className="block rounded-[var(--radius-md)] border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{list.title}</p>
                        <p className="text-xs text-muted-foreground">{formatMonthYear(list.month, list.year)}</p>
                      </div>
                      <Badge variant={STATUS_VARIANT[list.status]}>{LIST_STATUS_LABELS[list.status]}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={completion} className="h-1.5" />
                      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {completion.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{list.totalItems} items</span>
                      <span className="tabular-nums">
                        {formatCurrency(list.actualTotal, currency)} / {formatCurrency(list.plannedTotal, currency)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
