import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SmartInsight } from "@/types";

const TONE_CLASSES: Record<SmartInsight["tone"], string> = {
  positive: "bg-success-subtle text-success",
  neutral: "bg-secondary-subtle text-secondary",
  warning: "bg-warning-subtle text-warning",
};

export function InsightsCard({ insights }: { insights: SmartInsight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart insights</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a few shopping lists and we&apos;ll start surfacing insights here.
          </p>
        ) : (
          insights.map((insight) => (
            <div key={insight.id} className="flex items-start gap-3 rounded-[var(--radius-md)] bg-muted/50 p-3">
              <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", TONE_CLASSES[insight.tone])}>
                <Lightbulb className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm">{insight.message}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
