"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ShoppingListCard } from "@/components/shopping/ShoppingListCard";
import { CreateListDialog } from "@/components/shopping/CreateListDialog";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { useAuth } from "@/hooks/useAuth";
import { MONTH_NAMES } from "@/constants";
import { ClipboardList } from "lucide-react";
import { ListStatus, type ShoppingList } from "@/types";

type SortOption = "newest" | "oldest" | "highest" | "lowest";

export default function ShoppingListsPage() {
  const { lists, loading } = useShoppingLists();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [createOpen, setCreateOpen] = useState(false);

  const years = useMemo(() => {
    const unique = Array.from(new Set(lists.map((l) => l.year))).sort((a, b) => b - a);
    return unique;
  }, [lists]);

  const filtered = useMemo(() => {
    let result = lists.filter((list) => {
      const matchesSearch = list.title.toLowerCase().includes(search.toLowerCase());
      const matchesMonth = monthFilter === "all" || list.month === Number(monthFilter);
      const matchesYear = yearFilter === "all" || list.year === Number(yearFilter);
      const matchesStatus = statusFilter === "all" || list.status === statusFilter;
      return matchesSearch && matchesMonth && matchesYear && matchesStatus;
    });

    result = [...result].sort((a: ShoppingList, b: ShoppingList) => {
      switch (sort) {
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "highest":
          return b.actualTotal - a.actualTotal;
        case "lowest":
          return a.actualTotal - b.actualTotal;
        case "newest":
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    return result;
  }, [lists, search, monthFilter, yearFilter, statusFilter, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1">Shopping lists</h1>
          <p className="text-sm text-muted-foreground">Manage all your monthly shopping lists.</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New list
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search lists…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="sm:w-36">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {MONTH_NAMES.map((name, index) => (
              <SelectItem key={name} value={String(index + 1)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="sm:w-28">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value={ListStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={ListStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={ListStatus.ARCHIVED}>Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="highest">Highest total</SelectItem>
            <SelectItem value="lowest">Lowest total</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={lists.length === 0 ? "You haven't created any shopping lists yet." : "No lists match your filters."}
          description={
            lists.length === 0
              ? "Create your first list to start planning this month's groceries."
              : "Try adjusting your search or filters."
          }
          actionLabel={lists.length === 0 ? "Create shopping list" : undefined}
          onAction={lists.length === 0 ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((list) => (
            <ShoppingListCard key={list.id} list={list} currency={profile?.currency} />
          ))}
        </div>
      )}

      <CreateListDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
