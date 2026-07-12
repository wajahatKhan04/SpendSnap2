"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { monthName } from "@/lib/date";
import type { MonthlyAnalytics } from "@/types";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontSize: 12,
};

const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };

export function PlannedVsActualChart({ data }: { data: MonthlyAnalytics[] }) {
  const chartData = data.map((d) => ({
    name: `${monthName(d.month).slice(0, 3)} ${d.year}`,
    Planned: d.plannedTotal,
    Actual: d.actualTotal,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planned vs. actual</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
              <YAxis axisLine={false} tickLine={false} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Planned" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Actual" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function SpendingTrendChart({ data }: { data: MonthlyAnalytics[] }) {
  const chartData = data.map((d) => ({
    name: `${monthName(d.month).slice(0, 3)} ${d.year}`,
    Actual: d.actualTotal,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending trend</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RLineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
              <YAxis axisLine={false} tickLine={false} tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="Actual" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
            </RLineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
