import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BudgetCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  changeLabel?: string;
  changeTone?: "positive" | "negative" | "neutral";
  accent?: "primary" | "secondary" | "accent" | "danger";
}

const ACCENT_CLASSES: Record<NonNullable<BudgetCardProps["accent"]>, string> = {
  primary: "bg-primary-subtle text-primary",
  secondary: "bg-secondary-subtle text-secondary",
  accent: "bg-accent-subtle text-accent",
  danger: "bg-danger-subtle text-danger",
};

const CHANGE_CLASSES: Record<NonNullable<BudgetCardProps["changeTone"]>, string> = {
  positive: "text-success",
  negative: "text-danger",
  neutral: "text-muted-foreground",
};

export function BudgetCard({
  icon: Icon,
  label,
  value,
  changeLabel,
  changeTone = "neutral",
  accent = "primary",
}: BudgetCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", ACCENT_CLASSES[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="tabular-nums text-h2">{value}</p>
        {changeLabel && (
          <p className={cn("text-xs font-medium", CHANGE_CLASSES[changeTone])}>{changeLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
