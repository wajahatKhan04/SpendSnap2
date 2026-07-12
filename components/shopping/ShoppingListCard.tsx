"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Copy, Trash2, Archive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { LIST_STATUS_LABELS } from "@/constants";
import { calculateCompletionRate } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currency";
import { formatMonthYear, formatRelativeTime } from "@/lib/date";
import { toFriendlyError } from "@/lib/errors";
import { useAuth } from "@/hooks/useAuth";
import { archiveShoppingList, deleteShoppingList, duplicateShoppingList } from "@/services/shoppingLists.service";
import { toast } from "sonner";
import type { ShoppingList } from "@/types";
import { Currency, ListStatus } from "@/types";

const STATUS_VARIANT: Record<ListStatus, "success" | "secondary" | "muted"> = {
  [ListStatus.ACTIVE]: "success",
  [ListStatus.COMPLETED]: "secondary",
  [ListStatus.ARCHIVED]: "muted",
};

export function ShoppingListCard({ list, currency = Currency.PKR }: { list: ShoppingList; currency?: Currency }) {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const completion = calculateCompletionRate(list.completedItems, list.totalItems);

  async function handleDuplicate() {
    if (!firebaseUser) return;
    setBusy(true);
    try {
      const nextMonth = list.month === 12 ? 1 : list.month + 1;
      const nextYear = list.month === 12 ? list.year + 1 : list.year;
      const newId = await duplicateShoppingList(firebaseUser.uid, list.id, {
        title: `${list.title} (Copy)`,
        month: nextMonth,
        year: nextYear,
      });
      toast.success("List duplicated.");
      router.push(`/shopping-lists/${newId}`);
    } catch (err) {
      toast.error(toFriendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    if (!firebaseUser) return;
    try {
      await archiveShoppingList(firebaseUser.uid, list.id);
      toast.success("List archived.");
    } catch (err) {
      toast.error(toFriendlyError(err));
    }
  }

  async function confirmDelete() {
    if (!firebaseUser) return;
    setBusy(true);
    try {
      await deleteShoppingList(firebaseUser.uid, list.id);
      toast.success("List deleted.");
      setDeleteOpen(false);
    } catch (err) {
      toast.error(toFriendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/shopping-lists/${list.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">{list.title}</p>
              <p className="text-xs text-muted-foreground">{formatMonthYear(list.month, list.year)}</p>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[list.status]}>{LIST_STATUS_LABELS[list.status]}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`Actions for ${list.title}`}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/shopping-lists/${list.id}`}>
                      <Pencil className="h-4 w-4" /> View / edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate} disabled={busy}>
                    <Copy className="h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                  {list.status === ListStatus.ACTIVE && (
                    <DropdownMenuItem onClick={handleArchive}>
                      <Archive className="h-4 w-4" /> Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-danger focus:text-danger">
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Link href={`/shopping-lists/${list.id}`} className="block">
            <div className="mt-4 flex items-center gap-3">
              <Progress value={completion} className="h-1.5" />
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {completion.toFixed(0)}%
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{list.totalItems} items</span>
              <span className="tabular-nums">
                {formatCurrency(list.actualTotal, currency)} / {formatCurrency(list.plannedTotal, currency)}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Updated {formatRelativeTime(list.updatedAt)}</p>
          </Link>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &quot;{list.title}&quot;?</DialogTitle>
            <DialogDescription>
              This permanently deletes the list. Items inside it are not automatically removed and should be
              deleted first if you no longer need them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={busy}>
              {busy ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
