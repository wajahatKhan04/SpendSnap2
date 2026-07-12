"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Table } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportListToCsv, exportListToExcel, exportListToPdf } from "@/lib/export";
import { useAuth } from "@/hooks/useAuth";
import type { ShoppingItem, ShoppingList } from "@/types";
import { Currency } from "@/types";

interface ExportMenuProps {
  list: ShoppingList;
  items: ShoppingItem[];
  currency?: Currency;
}

export function ExportMenu({ list, items, currency = Currency.PKR }: ExportMenuProps) {
  const { profile, firebaseUser } = useAuth();
  const userName = profile?.displayName ?? firebaseUser?.displayName ?? "SpendSnap User";
  const [exporting, setExporting] = useState(false);

  async function run(fn: typeof exportListToPdf, label: string) {
    setExporting(true);
    try {
      await fn({ list, items, userName, currency });
      toast.success(`Export completed (${label}).`);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting}>
          <Download className="h-4 w-4" />
          {exporting ? "Exporting…" : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => run(exportListToPdf, "PDF")}>
          <FileText className="h-4 w-4" /> Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(exportListToCsv, "CSV")}>
          <Table className="h-4 w-4" /> Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(exportListToExcel, "Excel")}>
          <FileSpreadsheet className="h-4 w-4" /> Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
