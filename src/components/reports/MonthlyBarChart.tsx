import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { useCurrency } from "../../hooks/useCurrency";

type MonthData = {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
};

type Props = { data: MonthData[] };

function CustomTooltip({ active, payload, label }: any) {
  const { format: fmt } = useCurrency();
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-4 py-3 rounded-xl text-sm shadow-xl space-y-1"
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p
        className="font-bold mb-2"
        style={{
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </p>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-6"
        >
          <span
            className="flex items-center gap-1.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            {p.name}
          </span>
          <span className="font-semibold" style={{ color: p.color }}>
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyBarChart({ data }: Props) {
  const { format: fmt } = useCurrency();

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} barCategoryGap="30%">
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
          <YAxis
            tickFormatter={(v) => fmt(v).replace(/[^0-9KM.,₹$£€¥]/g, "")}
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "var(--color-surface-2)", radius: 6 }}
          />
          <Legend
            formatter={(v) => (
              <span
                style={{ color: "var(--color-text-secondary)", fontSize: 12 }}
              >
                {v}
              </span>
            )}
            iconType="circle"
            iconSize={8}
          />
          <ReferenceLine y={0} stroke="var(--color-border)" />
          <Bar
            dataKey="income"
            name="Income"
            fill="var(--color-income)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="expense"
            name="Expense"
            fill="var(--color-expense)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
