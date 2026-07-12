import { calculateMonthlyTrend } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currency";
import type { ShoppingList, SmartInsight } from "@/types";
import { Currency, ListStatus } from "@/types";

export function generateInsights(lists: ShoppingList[], currency: Currency = Currency.PKR): SmartInsight[] {
  const insights: SmartInsight[] = [];
  if (lists.length === 0) return insights;

  const sorted = [...lists].sort((a, b) => (a.year - b.year) || (a.month - b.month));
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];

  if (last && prev) {
    const trend = calculateMonthlyTrend(prev.actualTotal, last.actualTotal);
    if (trend < 0) {
      insights.push({
        id: "trend-down",
        message: `You spent ${Math.abs(trend).toFixed(0)}% less than last month. Nice work.`,
        tone: "positive",
      });
    } else if (trend > 10) {
      insights.push({
        id: "trend-up",
        message: `Spending is up ${trend.toFixed(0)}% compared to last month.`,
        tone: "warning",
      });
    }
  }

  // Consecutive months under budget (plannedTotal treated as the target line).
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].actualTotal <= sorted[i].plannedTotal) {
      streak += 1;
    } else {
      break;
    }
  }
  if (streak >= 2) {
    insights.push({
      id: "streak",
      message: `You stayed within budget for ${streak} consecutive month${streak === 1 ? "" : "s"}.`,
      tone: "positive",
    });
  }

  const completedCount = lists.filter((l) => l.status === ListStatus.COMPLETED || l.completedItems === l.totalItems && l.totalItems > 0).length;
  if (completedCount > 0) {
    insights.push({
      id: "completed",
      message: `You've fully completed ${completedCount} shopping list${completedCount === 1 ? "" : "s"} so far.`,
      tone: "neutral",
    });
  }

  const avgSpend = lists.reduce((sum, l) => sum + l.actualTotal, 0) / lists.length;
  if (avgSpend > 0) {
    insights.push({
      id: "average",
      message: `Your average monthly grocery spend is ${formatCurrency(avgSpend, currency)}.`,
      tone: "neutral",
    });
  }

  return insights.slice(0, 4);
}
