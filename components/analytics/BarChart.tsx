"use client";

import { Bar, BarChart as RBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { monthName } from "@/lib/date";
import type { MonthlyAnalytics } from "@/types";

export function BarChart({ data }: { data: MonthlyAnalytics[] }) {
  const chartData = data.map((d) => ({ name: `${monthName(d.month).slice(0, 3)} ${d.year}`, Actual: d.actualTotal }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly spending</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RBarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="Actual" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
