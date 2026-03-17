import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useCurrency } from "../../hooks/useCurrency";

type MonthData = { label: string; net: number };
type Props = { data: MonthData[] };

function CustomTooltip({ active, payload, label }: any) {
  const { format: fmt } = useCurrency();
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const pos = val >= 0;
  return (
    <div
      className="px-4 py-3 rounded-xl text-sm shadow-xl"
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p
        className="font-bold"
        style={{
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </p>
      <p
        className="font-semibold mt-1"
        style={{ color: pos ? "var(--color-income)" : "var(--color-expense)" }}
      >
        {pos ? "+" : ""}
        {fmt(val)}
      </p>
    </div>
  );
}

export function NetLineChart({ data }: Props) {
  return (
    <div style={{ height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={0}
            stroke="var(--color-border)"
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            dot={{ fill: "var(--color-accent)", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
