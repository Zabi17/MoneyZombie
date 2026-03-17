import { useState } from "react";
import { format } from "date-fns";
import { useReports } from "../hooks/useReports";
import { useCurrency } from "../hooks/useCurrency";
import { useAppStore } from "../store/useAppStore";
import { MonthlyBarChart } from "../components/reports/MonthlyBarChart";
import { NetLineChart } from "../components/reports/NetLineChart";
import { AllTimeCategoryList } from "../components/reports/AllTimeCategoryList";
import { StatHighlight } from "../components/reports/StatHighlight";
import { ExportButton } from "../components/reports/ExportButton";

const RANGE_OPTIONS = [
  { label: "3M", value: 3 },
  { label: "6M", value: 6 },
  { label: "12M", value: 12 },
];

export default function Reports() {
  const [range, setRange] = useState(6);
  const { format: fmt } = useCurrency();
  const categories = useAppStore((s) => s.categories);
  const {
    monthly,
    categoryTotals,
    grandTotal,
    biggestExpense,
    avgMonthly,
    savingsRate,
    lastMonth,
  } = useReports(range);

  const biggestCat = biggestExpense
    ? categories.find((c) => c.id === biggestExpense.categoryId)
    : null;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-widest mb-0.5"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            Analytics
          </p>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Reports
          </h1>
        </div>
        <ExportButton />
      </div>

      {/* Range selector */}
      <div className="flex gap-2">
        {RANGE_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
            style={{
              background:
                range === value
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
              color: range === value ? "black" : "var(--color-text-secondary)",
              border: `1px solid ${range === value ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Highlight stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatHighlight
          label="Avg / Month"
          value={fmt(avgMonthly)}
          sub="expenses"
          color="var(--color-expense)"
        />
        <StatHighlight
          label="Savings Rate"
          value={`${savingsRate.toFixed(0)}%`}
          sub={format(new Date(lastMonth.month + "-01"), "MMMM")}
          color={
            savingsRate >= 0 ? "var(--color-income)" : "var(--color-expense)"
          }
        />
        <StatHighlight
          label="Biggest Spend"
          value={biggestExpense ? fmt(biggestExpense.amount) : "—"}
          sub={biggestExpense?.title ?? "No data"}
        />
        <StatHighlight
          label="Top Category"
          value={categoryTotals[0]?.name ?? "—"}
          sub={categoryTotals[0] ? fmt(categoryTotals[0].total) : "No data"}
          color={categoryTotals[0]?.color}
        />
      </div>

      {/* Monthly bar chart */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-widest mb-5"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-muted)",
          }}
        >
          Income vs Expenses
        </h2>
        {grandTotal === 0 && monthly.every((m) => m.income === 0) ? (
          <p
            className="text-sm text-center py-8"
            style={{ color: "var(--color-text-muted)" }}
          >
            No data for this period
          </p>
        ) : (
          <MonthlyBarChart data={monthly} />
        )}
      </div>

      {/* Net savings line */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-widest mb-5"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-muted)",
          }}
        >
          Net Savings Trend
        </h2>
        <NetLineChart data={monthly} />
      </div>

      {/* All-time category breakdown */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-sm font-semibold uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-muted)",
            }}
          >
            All-Time by Category
          </h2>
          <span
            className="text-sm font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {fmt(grandTotal)}
          </span>
        </div>
        <AllTimeCategoryList data={categoryTotals} grandTotal={grandTotal} />
      </div>
    </div>
  );
}
