"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { getItemPriceHistory, summarizePriceHistory } from "@/services/priceHistory.service";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { PriceHistoryEntry } from "@/types";
import { Currency } from "@/types";

interface PriceHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  itemId: string;
  itemName: string;
  currency?: Currency;
}

export function PriceHistoryDialog({
  open,
  onOpenChange,
  listId,
  itemId,
  itemName,
  currency = Currency.PKR,
}: PriceHistoryDialogProps) {
  const { firebaseUser } = useAuth();
  const [entries, setEntries] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !firebaseUser) return;
    setLoading(true);
    getItemPriceHistory(firebaseUser.uid, listId, itemId)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [open, firebaseUser, listId, itemId]);

  const stats = summarizePriceHistory(entries);
  const chartData = entries.map((e) => ({ date: formatDate(e.date), price: e.price }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Price history — {itemName}</DialogTitle>
          <DialogDescription>Every recorded change to this item&apos;s actual unit price.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <LoadingSpinner />
        ) : entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No price changes recorded yet. This tracks automatically the next time you update this item&apos;s actual price.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Lowest" value={formatCurrency(stats.lowest, currency)} />
              <Stat label="Average" value={formatCurrency(stats.average, currency)} />
              <Stat label="Highest" value={formatCurrency(stats.highest, currency)} />
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tabular-nums text-sm font-semibold">{value}</p>
    </div>
  );
}
