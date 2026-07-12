import { Currency, ItemStatus, ListStatus, Unit } from "@/types";
import {
  LayoutDashboard,
  ListChecks,
  BarChart3,
  Settings,
  User,
} from "lucide-react";

export const APP_NAME = "SpendSnap";
export const APP_TAGLINE = "Smart Shopping. Smarter Budgeting.";

// Firestore collection names, centralized so no string is duplicated
// across service modules.
export const COLLECTIONS = {
  USERS: "users",
  SHOPPING_LISTS: "shoppingLists",
  ITEMS: "items",
  PRICE_HISTORY: "priceHistory",
} as const;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Lists", href: "/shopping-lists", icon: ListChecks },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export const SIDEBAR_NAV_ITEMS = [
  ...NAV_ITEMS,
  { label: "Profile", href: "/profile", icon: User },
] as const;

export const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: Currency.PKR, label: "Pakistani Rupee", symbol: "Rs" },
  { value: Currency.USD, label: "US Dollar", symbol: "$" },
  { value: Currency.EUR, label: "Euro", symbol: "€" },
  { value: Currency.GBP, label: "British Pound", symbol: "£" },
  { value: Currency.AED, label: "UAE Dirham", symbol: "AED" },
  { value: Currency.SAR, label: "Saudi Riyal", symbol: "SAR" },
];

export const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: Unit.PIECE, label: "Piece" },
  { value: Unit.KG, label: "Kg" },
  { value: Unit.GRAM, label: "Gram" },
  { value: Unit.LITER, label: "Liter" },
  { value: Unit.ML, label: "ml" },
  { value: Unit.BOTTLE, label: "Bottle" },
  { value: Unit.PACKET, label: "Packet" },
  { value: Unit.PACK, label: "Pack" },
  { value: Unit.DOZEN, label: "Dozen" },
  { value: Unit.BOX, label: "Box" },
];

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  [ItemStatus.NOT_BOUGHT]: "Not bought",
  [ItemStatus.PARTIAL]: "Partial",
  [ItemStatus.BOUGHT]: "Bought",
  [ItemStatus.NOT_AVAILABLE]: "Not available",
};

export const LIST_STATUS_LABELS: Record<ListStatus, string> = {
  [ListStatus.ACTIVE]: "Active",
  [ListStatus.COMPLETED]: "Completed",
  [ListStatus.ARCHIVED]: "Archived",
};

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

// 8px spacing scale reference (enforced via Tailwind's default 4px step,
// used in multiples of 2 throughout the app: 8/16/24/32/40/48/64).
export const SPACING = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  "2xl": 48,
  "3xl": 64,
} as const;

// Budget usage thresholds for color coding progress indicators.
export const BUDGET_THRESHOLDS = {
  SAFE: 70,
  WARNING: 90,
} as const;
