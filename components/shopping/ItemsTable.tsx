"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, LineChart as LineChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shopping/StatusBadge";
import { PriceBadge } from "@/components/shopping/PriceBadge";
import { PriceHistoryDialog } from "@/components/shopping/PriceHistoryDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PackageOpen } from "lucide-react";
import { UNIT_OPTIONS } from "@/constants";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/hooks/useAuth";
import { deleteItem } from "@/services/shoppingItems.service";
import { toFriendlyError } from "@/lib/errors";
import { toast } from "sonner";
import type { ShoppingItem } from "@/types";
import { Currency } from "@/types";

interface ItemsTableProps {
  items: ShoppingItem[];
  listId: string;
  currency?: Currency;
  onEdit: (item: ShoppingItem) => void;
  onAddItem: () => void;
}

const unitLabel = (unit: ShoppingItem["unit"]) => UNIT_OPTIONS.find((u) => u.value === unit)?.label ?? unit;

export function ItemsTable({ items, listId, currency = Currency.PKR, onEdit, onAddItem }: ItemsTableProps) {
  const { firebaseUser } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<ShoppingItem | null>(null);
  const [historyTarget, setHistoryTarget] = useState<ShoppingItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!firebaseUser || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteItem(firebaseUser.uid, listId, deleteTarget.id);
      toast.success("Item deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(toFriendlyError(error));
    } finally {
      setDeleting(false);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No items added."
        description="Add your first grocery item to start tracking this list."
        actionLabel="Add item"
        onAction={onAddItem}
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-border lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Planned</th>
              <th className="px-4 py-3">Actual</th>
              <th className="px-4 py-3">Difference</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{item.name}</p>
                  {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {item.quantity} {unitLabel(item.unit)}
                </td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(item.plannedTotal, currency)}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(item.actualTotal, currency)}</td>
                <td className="px-4 py-3">
                  <PriceBadge planned={item.plannedUnitPrice} actual={item.actualUnitPrice} currency={currency} />
                </td>
                <td className="px-4 py-3 text-right">
                  <RowMenu item={item} onEdit={onEdit} onDelete={() => setDeleteTarget(item)} onViewHistory={() => setHistoryTarget(item)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {items.map((item) => (
          <div key={item.id} className="rounded-[var(--radius-lg)] border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} {unitLabel(item.unit)} {item.category ? `· ${item.category}` : ""}
                </p>
              </div>
              <RowMenu item={item} onEdit={onEdit} onDelete={() => setDeleteTarget(item)} onViewHistory={() => setHistoryTarget(item)} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <StatusBadge status={item.status} />
              <PriceBadge planned={item.plannedUnitPrice} actual={item.actualUnitPrice} currency={currency} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Planned {formatCurrency(item.plannedTotal, currency)}</span>
              <span>Actual {formatCurrency(item.actualTotal, currency)}</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item?</DialogTitle>
            <DialogDescription>
              This will permanently remove &quot;{deleteTarget?.name}&quot; from this list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {historyTarget && (
        <PriceHistoryDialog
          open={Boolean(historyTarget)}
          onOpenChange={(open) => !open && setHistoryTarget(null)}
          listId={listId}
          itemId={historyTarget.id}
          itemName={historyTarget.name}
          currency={currency}
        />
      )}
    </>
  );
}

function RowMenu({
  item,
  onEdit,
  onDelete,
  onViewHistory,
}: {
  item: ShoppingItem;
  onEdit: (item: ShoppingItem) => void;
  onDelete: () => void;
  onViewHistory: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${item.name}`}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(item)}>
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewHistory}>
          <LineChartIcon className="h-4 w-4" /> Price history
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-danger focus:text-danger">
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
