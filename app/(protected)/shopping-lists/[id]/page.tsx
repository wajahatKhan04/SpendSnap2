"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Archive, ChevronLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { ItemsTable } from "@/components/shopping/ItemsTable";
import { ItemForm } from "@/components/shopping/ItemForm";
import { BudgetProgress } from "@/components/shopping/BudgetProgress";
import { ExportMenu } from "@/components/shopping/ExportMenu";
import { useAuth } from "@/hooks/useAuth";
import { useShoppingList } from "@/hooks/useShoppingList";
import { LIST_STATUS_LABELS } from "@/constants";
import { formatMonthYear } from "@/lib/date";
import { toFriendlyError } from "@/lib/errors";
import { archiveShoppingList, duplicateShoppingList } from "@/services/shoppingLists.service";
import { toast } from "sonner";
import { ListStatus, type ShoppingItem } from "@/types";
import Link from "next/link";

const STATUS_VARIANT: Record<ListStatus, "success" | "secondary" | "muted"> = {
  [ListStatus.ACTIVE]: "success",
  [ListStatus.COMPLETED]: "secondary",
  [ListStatus.ARCHIVED]: "muted",
};

export default function ShoppingListDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { firebaseUser, profile } = useAuth();
  const { list, items, loading, error, summary } = useShoppingList(params.id);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [duplicating, setDuplicating] = useState(false);

  function openAddItem() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEditItem(item: ShoppingItem) {
    setEditingItem(item);
    setFormOpen(true);
  }

  async function handleArchive() {
    if (!firebaseUser || !list) return;
    try {
      await archiveShoppingList(firebaseUser.uid, list.id);
      toast.success("List archived.");
    } catch (err) {
      toast.error(toFriendlyError(err));
    }
  }

  async function handleDuplicate() {
    if (!firebaseUser || !list) return;
    setDuplicating(true);
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
      setDuplicating(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!list) {
    return <ErrorState message="This shopping list doesn't exist or you don't have access to it." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/shopping-lists"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to lists
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-h1">{list.title}</h1>
              <Badge variant={STATUS_VARIANT[list.status]}>{LIST_STATUS_LABELS[list.status]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{formatMonthYear(list.month, list.year)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicating}>
              <Copy className="h-4 w-4" />
              {duplicating ? "Duplicating…" : "Duplicate"}
            </Button>
            <ExportMenu list={list} items={items} currency={profile?.currency} />
            {list.status === ListStatus.ACTIVE && (
              <Button variant="outline" size="sm" onClick={handleArchive}>
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
            <Button size="sm" onClick={openAddItem}>
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ItemsTable
            items={items}
            listId={list.id}
            currency={profile?.currency}
            onEdit={openEditItem}
            onAddItem={openAddItem}
          />
        </div>
        <div className="lg:col-span-1">
          <BudgetProgress
            list={list}
            difference={summary.difference}
            completionRate={summary.completionRate}
            currency={profile?.currency}
          />
        </div>
      </div>

      <ItemForm
        open={formOpen}
        onOpenChange={setFormOpen}
        listId={list.id}
        item={editingItem}
        currency={profile?.currency}
      />
    </div>
  );
}
