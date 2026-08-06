"use client";
/**
 * Wrapper Recharts reusable — dipakai oleh modul dashboard / statistik.
 * Semua responsif (ResponsiveContainer, tinggi 260). Beri title via <Card> di pemanggil.
 */
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/primitives";

/* ---------- ChartCard: judul di dalam Card + subteks abu ---------- */
export function ChartCard({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`p-5 ${className || ""}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-heading dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </Card>
  );
}

export const CHART = {
  green: "#2e7d32",
  amber: "#FBC02D",
  red: "#dc2626",
  blue: "#2563eb",
  gray: "#e5e7eb",
};

const HEIGHT = 260;

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid rgba(148,163,184,0.3)",
  fontSize: 12,
  background: "rgba(255,255,255,0.98)",
  color: "#15281f",
};

const axisProps = {
  tick: { fontSize: 11, fill: "#94a3b8" },
  axisLine: { stroke: "#e2e8f0" },
  tickLine: false,
} as const;

export type Slice = { name: string; value: number; color?: string };
export type Point = { name: string; value: number };

/* ---------- Donut ---------- */
export function DonutChart({
  data,
  centerLabel,
  showLegend = false,
  height = HEIGHT,
}: {
  data: Slice[];
  centerLabel?: string;
  showLegend?: boolean;
  height?: number;
}) {
  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={data.length > 1 ? 2 : 0}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color || CHART.green} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={28}
              iconType="circle"
              wrapperStyle={{ fontSize: 12 }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      {centerLabel !== undefined && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ paddingBottom: showLegend ? 28 : 0 }}
        >
          <span className="text-3xl font-bold text-heading dark:text-white">
            {centerLabel}
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- Bar ---------- */
export function BarChartMini({
  data,
  color = CHART.green,
  height = HEIGHT,
}: {
  data: Point[];
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" {...axisProps} interval={0} />
        <YAxis {...axisProps} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------- Line ---------- */
export function LineChartMini({
  data,
  color = CHART.blue,
  height = HEIGHT,
}: {
  data: Point[];
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" {...axisProps} interval={0} />
        <YAxis {...axisProps} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ---------- Area ---------- */
export function AreaChartMini({
  data,
  color = CHART.blue,
  height = HEIGHT,
}: {
  data: Point[];
  color?: string;
  height?: number;
}) {
  const gid = `area-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" {...axisProps} interval={0} />
        <YAxis {...axisProps} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gid})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
