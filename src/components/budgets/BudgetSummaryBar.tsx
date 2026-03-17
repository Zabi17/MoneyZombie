import { useCurrency } from "../../hooks/useCurrency";

type Props = {
  totalBudget: number;
  totalSpent: number;
};

export function BudgetSummaryBar({ totalBudget, totalSpent }: Props) {
  const { format: fmt } = useCurrency();
  const percent =
    totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOver = totalSpent > totalBudget;
  const color = isOver
    ? "var(--color-expense)"
    : percent > 80
      ? "var(--color-warning)"
      : "var(--color-income)";

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-end justify-between mb-3">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            Total Budget
          </p>
          <p
            className="text-3xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            {fmt(totalBudget)}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-xs mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Spent
          </p>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-display)", color }}
          >
            {fmt(totalSpent)}
          </p>
        </div>
      </div>

      {/* Bar */}
      <div
        className="h-3 rounded-full overflow-hidden"
        style={{ background: "var(--color-surface-2)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {percent.toFixed(0)}% used
        </span>
        <span
          className="text-xs"
          style={{
            color: isOver ? "var(--color-expense)" : "var(--color-text-muted)",
          }}
        >
          {isOver
            ? `${fmt(totalSpent - totalBudget)} over budget`
            : `${fmt(totalBudget - totalSpent)} remaining`}
        </span>
      </div>
    </div>
  );
}
