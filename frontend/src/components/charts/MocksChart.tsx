"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MockDataPoint {
  name: string;
  score: number;
  qa: number;
  reas: number;
  eng: number;
}

export function MocksChart({ data }: { data: MockDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis
          dataKey="name"
          stroke="var(--color-muted-foreground)"
          tick={{ fontFamily: "monospace", fontSize: 10 }}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          tick={{ fontFamily: "monospace", fontSize: 10 }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            fontFamily: "monospace",
          }}
          itemStyle={{ color: "var(--color-foreground)" }}
          labelStyle={{ color: "var(--color-muted-foreground)", marginBottom: "8px" }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorScore)"
          activeDot={{
            r: 6,
            fill: "var(--color-primary)",
            stroke: "var(--color-background)",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
