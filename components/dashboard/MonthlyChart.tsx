"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyAnalytics } from "@/types";
import { monthName } from "@/lib/date";

export function MonthlyChart({ data }: { data: MonthlyAnalytics[] }) {
  const chartData = data.map((d) => ({
    name: monthName(d.month).slice(0, 3),
    Planned: d.plannedTotal,
    Actual: d.actualTotal,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending trend</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No spending data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="Planned" stroke="var(--secondary)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Actual" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
