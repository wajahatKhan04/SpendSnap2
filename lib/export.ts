import { APP_NAME } from "@/constants";
import { formatCurrency } from "@/lib/currency";
import { formatMonthYear } from "@/lib/date";
import type { ShoppingItem, ShoppingList } from "@/types";
import { Currency } from "@/types";

// jsPDF, jspdf-autotable, xlsx, and papaparse are all sizeable libraries that
// only matter the moment someone clicks "Export" — so each export function
// below dynamically imports its dependency instead of bundling it into the
// shopping-list page's initial JS payload.

interface ExportContext {
  list: ShoppingList;
  items: ShoppingItem[];
  userName: string;
  currency?: Currency;
}

function rows(items: ShoppingItem[]) {
  return items.map((item) => [
    item.name,
    String(item.quantity),
    item.unit,
    item.plannedTotal.toFixed(2),
    item.actualTotal.toFixed(2),
    (item.actualTotal - item.plannedTotal).toFixed(2),
    item.status,
  ]);
}

const HEADERS = ["Item", "Qty", "Unit", "Planned", "Actual", "Difference", "Status"];

export async function exportListToPdf({ list, items, userName, currency = Currency.PKR }: ExportContext) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(APP_NAME, 14, 18);
  doc.setFontSize(10);
  doc.text(`Prepared for: ${userName}`, 14, 25);
  doc.text(`List: ${list.title} — ${formatMonthYear(list.month, list.year)}`, 14, 31);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);

  autoTable(doc, {
    startY: 44,
    head: [HEADERS],
    body: rows(items),
    headStyles: { fillColor: [5, 150, 105] },
    styles: { fontSize: 9 },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Planned total: ${formatCurrency(list.plannedTotal, currency)}`, 14, finalY);
  doc.text(`Actual total: ${formatCurrency(list.actualTotal, currency)}`, 14, finalY + 6);

  doc.save(`${list.title.replace(/\s+/g, "-")}.pdf`);
}

export async function exportListToCsv({ list, items }: ExportContext) {
  const { default: Papa } = await import("papaparse");
  const csv = Papa.unparse({
    fields: HEADERS,
    data: rows(items),
  });
  downloadBlob(csv, `${list.title.replace(/\s+/g, "-")}.csv`, "text/csv;charset=utf-8;");
}

export async function exportListToExcel({ list, items, currency = Currency.PKR }: ExportContext) {
  const XLSX = await import("xlsx");

  const worksheetData = [
    HEADERS,
    ...rows(items),
    [],
    ["Planned total", "", "", "", "", formatCurrency(list.plannedTotal, currency)],
    ["Actual total", "", "", "", "", formatCurrency(list.actualTotal, currency)],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet["!cols"] = [{ wch: 24 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Items");
  XLSX.writeFile(workbook, `${list.title.replace(/\s+/g, "-")}.xlsx`);
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
