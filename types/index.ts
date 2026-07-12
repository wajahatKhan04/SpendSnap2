// ---------------------------------------------------------------------------
// SpendSnap — Core domain types
// Every Firestore entity and cross-feature data shape is defined here so the
// rest of the app never needs inline object types for domain data.
// ---------------------------------------------------------------------------

/** Lifecycle status of a single shopping item. Never store free-text status. */
export enum ItemStatus {
  NOT_BOUGHT = "NOT_BOUGHT",
  PARTIAL = "PARTIAL",
  BOUGHT = "BOUGHT",
  NOT_AVAILABLE = "NOT_AVAILABLE",
}

/** Lifecycle status of a shopping list. */
export enum ListStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

/** Supported measurement units. Designed to be easy to extend. */
export enum Unit {
  PIECE = "PIECE",
  KG = "KG",
  GRAM = "GRAM",
  LITER = "LITER",
  ML = "ML",
  BOTTLE = "BOTTLE",
  PACKET = "PACKET",
  PACK = "PACK",
  DOZEN = "DOZEN",
  BOX = "BOX",
}

/** Supported currencies. Formatting is centralized in lib/currency.ts. */
export enum Currency {
  PKR = "PKR",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  AED = "AED",
  SAR = "SAR",
}

export enum ThemePreference {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  monthlyBudget: number;
  currency: Currency;
  theme: ThemePreference;
  language: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

export interface ShoppingList {
  id: string;
  userId: string;
  title: string;
  month: number; // 1-12
  year: number;
  status: ListStatus;
  plannedTotal: number;
  actualTotal: number;
  remainingBudget: number;
  completedItems: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: Unit;
  plannedUnitPrice: number;
  actualUnitPrice: number;
  plannedTotal: number;
  actualTotal: number;
  difference: number;
  status: ItemStatus;
  notes: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistoryEntry {
  id: string;
  itemId: string;
  price: number;
  date: string;
  month: number;
  year: number;
}

// ---------------------------------------------------------------------------
// Derived / computed shapes (not persisted as-is)
// ---------------------------------------------------------------------------

export interface BudgetSummary {
  monthlyBudget: number;
  plannedSpending: number;
  actualSpending: number;
  remainingBudget: number;
  budgetUsagePercentage: number;
}

export interface DashboardSummary {
  budget: BudgetSummary;
  savings: number;
  mostExpensiveItem: ShoppingItem | null;
  mostPurchasedItem: string | null;
  completedListsCount: number;
  averageMonthlySpend: number;
  recentLists: ShoppingList[];
}

export interface MonthlyAnalytics {
  month: number;
  year: number;
  plannedTotal: number;
  actualTotal: number;
}

export interface YearlyAnalytics {
  year: number;
  totalSpent: number;
  monthlyBreakdown: MonthlyAnalytics[];
}

export interface AnalyticsData {
  monthly: MonthlyAnalytics[];
  yearly: YearlyAnalytics[];
  categoryDistribution: ChartData[];
  priceTrends: PriceHistoryEntry[];
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface ExportOptions {
  format: "pdf" | "csv" | "xlsx";
  listId: string;
  includeHeader: boolean;
}

export interface SmartInsight {
  id: string;
  message: string;
  tone: "positive" | "neutral" | "warning";
}
