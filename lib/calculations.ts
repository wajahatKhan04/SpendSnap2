import { BUDGET_THRESHOLDS } from "@/constants";
import type { ShoppingItem, ShoppingList } from "@/types";

/** quantity × unit price, rounded to 2 decimal places. */
export function calculateItemTotal(quantity: number, unitPrice: number): number {
  return round2(quantity * unitPrice);
}

/** Sum of actual totals (or planned totals) across every item in a list. */
export function calculateListTotal(
  items: Pick<ShoppingItem, "plannedTotal" | "actualTotal">[],
  field: "plannedTotal" | "actualTotal" = "actualTotal"
): number {
  return round2(items.reduce((sum, item) => sum + (item[field] || 0), 0));
}

/** Budget minus what's actually been spent so far. */
export function calculateBudgetRemaining(monthlyBudget: number, actualSpending: number): number {
  return round2(monthlyBudget - actualSpending);
}

/** Actual minus planned. Positive = overspent, negative = underspent. */
export function calculateDifference(planned: number, actual: number): number {
  return round2(actual - planned);
}

/** Positive when actual spending came in under the plan. */
export function calculateSavings(planned: number, actual: number): number {
  return round2(planned - actual);
}

export function calculateAveragePrice(prices: number[]): number {
  if (prices.length === 0) return 0;
  return round2(prices.reduce((sum, p) => sum + p, 0) / prices.length);
}

/** What % of the monthly budget has been used. Clamped at a sane ceiling for display. */
export function calculateBudgetPercentage(monthlyBudget: number, actualSpending: number): number {
  if (monthlyBudget <= 0) return 0;
  return round1((actualSpending / monthlyBudget) * 100);
}

/** % change in spend between two consecutive periods. */
export function calculateMonthlyTrend(previous: number, current: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return round1(((current - previous) / previous) * 100);
}

/** % change in a single item's price between two recorded prices. */
export function calculateInflation(oldPrice: number, newPrice: number): number {
  if (oldPrice <= 0) return 0;
  return round1(((newPrice - oldPrice) / oldPrice) * 100);
}

export function calculateCompletionRate(completedItems: number, totalItems: number): number {
  if (totalItems <= 0) return 0;
  return round1((completedItems / totalItems) * 100);
}

/** Maps budget usage % to a semantic status for color coding. */
export function getBudgetStatus(percentage: number): "safe" | "warning" | "danger" {
  if (percentage >= BUDGET_THRESHOLDS.WARNING) return "danger";
  if (percentage >= BUDGET_THRESHOLDS.SAFE) return "warning";
  return "safe";
}

export function summarizeList(list: Pick<ShoppingList, "plannedTotal" | "actualTotal" | "completedItems" | "totalItems">) {
  return {
    difference: calculateDifference(list.plannedTotal, list.actualTotal),
    completionRate: calculateCompletionRate(list.completedItems, list.totalItems),
  };
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function round1(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}
