"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { revenueChartData } from "../../data/mockData";

const chartColors = {
  grid: "#E3DBD2",
  axis: "#75837C",
  bar: "#234539",
  line: "#4F7264",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#D9D2C7",
};

const axisTick = {
  fill: chartColors.axis,
  fontSize: 11,
  fontFamily: "var(--font-mono)",
};

const tooltipStyle = {
  background: chartColors.tooltipBg,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: 4,
  fontSize: 12,
  fontFamily: "var(--font-mono)",
};

type RevenueChartProps = {
  variant?: "bar" | "line";
  height?: number;
};

function formatChartData() {
  return revenueChartData.map((item) => ({
    label: item.month.charAt(0) + item.month.slice(1).toLowerCase(),
    value: Math.round(item.value / 1000),
  }));
}

function RevenueBarChart({ height }: { height: number }) {
  const chartData = useMemo(() => formatChartData(), []);

  return (
    <div className="chart-panel" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
          barCategoryGap="22%"
        >
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `GH₵${v}k`}
            width={56}
            domain={[0, (max: number) => Math.ceil(max * 1.12 / 4) * 4]}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(35, 69, 57, 0.06)" }}
            formatter={(value) => [`GH₵ ${value}k`, "Revenue"]}
          />
          <Bar dataKey="value" fill={chartColors.bar} radius={[2, 2, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChart({ variant = "bar", height = 280 }: RevenueChartProps) {
  const lineData = useMemo(() => formatChartData(), []);

  if (variant === "bar") {
    return <RevenueBarChart height={height} />;
  }

  return (
    <div className="chart-panel" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `GH₵${v}k`}
            width={56}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`GH₵ ${value}k`, "Revenue"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={chartColors.line}
            strokeWidth={2}
            dot={{ r: 3, fill: chartColors.bar }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
