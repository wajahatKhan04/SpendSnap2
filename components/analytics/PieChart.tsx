"use client";

import { Cell, Pie, PieChart as RPieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartData } from "@/types";

const COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "var(--accent)",
  "var(--warning)",
  "var(--danger)",
  "var(--success)",
  "var(--muted-foreground)",
  "var(--info)",
];

export function PieChart({ data }: { data: ChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Add categories to your items to see this breakdown.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RPieChart>
              <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.map((entry, index) => (
                  <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RPieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
