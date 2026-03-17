import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAppStore } from "../../store/useAppStore";
import { useTransactions } from "../../hooks/useTransactions";
import { useCurrency } from "../../hooks/useCurrency";
import { format } from "date-fns";

const RADIAN = Math.PI / 180;

function CustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) {
  if (percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CustomTooltip({ active, payload }: any) {
  const { format: fmt } = useCurrency();
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      className="px-3 py-2 rounded-xl text-sm shadow-xl"
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p
        className="font-semibold"
        style={{ color: "var(--color-text-primary)" }}
      >
        {d.name}
      </p>
      <p style={{ color: d.payload.color }}>{fmt(d.value)}</p>
    </div>
  );
}

export function SpendingPieChart() {
  const categories = useAppStore((s) => s.categories);
  const currentMonth = format(new Date(), "yyyy-MM");
  const { expenses } = useTransactions(currentMonth);
  const { format: fmt } = useCurrency();

  const data = categories
    .filter((c) => c.type === "expense")
    .map((c) => ({
      name: c.name,
      color: c.color,
      value: expenses
        .filter((t) => t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-48 gap-2"
        style={{ color: "var(--color-text-muted)" }}
      >
        <p className="text-sm">No expenses this month</p>
        <p className="text-xs">Add your first transaction</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span
                style={{ color: "var(--color-text-secondary)", fontSize: 12 }}
              >
                {value}
              </span>
            )}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
