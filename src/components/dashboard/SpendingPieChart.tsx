import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";
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
    <div className="px-3 py-2 rounded-xl text-sm shadow-xl bg-surface-2 border border-border">
      <p className="font-semibold text-text-primary">{d.name}</p>
      <p style={{ color: d.payload.color }}>{fmt(d.value)}</p>
      <p className="text-xs mt-1 text-text-muted">Click to hide</p>
    </div>
  );
}

export function SpendingPieChart() {
  const categories = useAppStore((s) => s.categories);
  const currentMonth = format(new Date(), "yyyy-MM");
  const { expenses } = useTransactions(currentMonth);
  const { format: fmt } = useCurrency();
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(
    new Set(),
  );

  const allData = categories
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

  const data = allData.filter((d) => !hiddenCategories.has(d.name));

  const toggleCategory = (name: string) => {
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      const visibleCount = allData.filter((d) => !prev.has(d.name)).length;
      if (!prev.has(name)) {
        if (visibleCount <= 1) return prev;
        next.add(name);
      } else {
        next.delete(name);
      }
      return next;
    });
  };

  if (allData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-(--color-tex
      t-muted)">
        <p className="text-sm">No expenses this month</p>
        <p className="text-xs">Add your first transaction</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="h-65">
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
              onClick={(entry) => toggleCategory(entry.name)}
              className="cursor-pointer select-none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={() => (
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                  {allData.map((d) => {
                    const isHidden = hiddenCategories.has(d.name);
                    return (
                      <div
                        key={d.name}
                        onClick={() => toggleCategory(d.name)}
                        className="flex items-center gap-1 cursor-pointer select-none transition-opacity duration-200"
                        style={{ opacity: isHidden ? 0.4 : 1 }}
                      >
                        <span
                          className="inline-block rounded-full size-2 transition-colors duration-200"
                          style={{
                            background: isHidden
                              ? "var(--color-text-muted)"
                              : d.color,
                          }}
                        />
                        <span
                          className="text-xs transition-all duration-200"
                          style={{
                            color: isHidden
                              ? "var(--color-text-muted)"
                              : "var(--color-text-secondary)",
                            textDecoration: isHidden ? "line-through" : "none",
                          }}
                        >
                          {d.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {hiddenCategories.size > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => setHiddenCategories(new Set())}
            className="text-xs px-3 py-1 rounded-full transition-all cursor-pointer text-text-muted border border-(--color-border) bg-(--color-surface-2)"
          >
            Reset ({hiddenCategories.size} hidden)
          </button>
        </div>
      )}
    </div>
  );
}
