import { useAppStore } from "../../store/useAppStore";
import { useTransactions } from "../../hooks/useTransactions";
import { useCurrency } from "../../hooks/useCurrency";
import { format } from "date-fns";
import * as Icons from "lucide-react";

export function CategoryBreakdown() {
  const categories = useAppStore((s) => s.categories);
  const currentMonth = format(new Date(), "yyyy-MM");
  const { expenses, totalExpense } = useTransactions(currentMonth);
  const { format: fmt } = useCurrency();

  const breakdown = categories
    .filter((c) => c.type === "expense")
    .map((c) => ({
      ...c,
      spent: expenses
        .filter((t) => t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0),
    }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  if (breakdown.length === 0) {
    return (
      <p
        className="text-sm py-4 text-center"
        style={{ color: "var(--color-text-muted)" }}
      >
        No data yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {breakdown.map((cat) => {
        const IconComp = (Icons as any)[cat.icon] ?? Icons.CircleDot;
        const pct = totalExpense > 0 ? (cat.spent / totalExpense) * 100 : 0;
        return (
          <div key={cat.id}>
            <div className="flex items-center gap-3 mb-1.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${cat.color}20`, color: cat.color }}
              >
                <IconComp size={14} />
              </div>
              <span
                className="text-sm font-medium flex-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                {cat.name}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {fmt(cat.spent)}
              </span>
              <span
                className="text-xs w-10 text-right"
                style={{ color: "var(--color-text-muted)" }}
              >
                {pct.toFixed(0)}%
              </span>
            </div>
            {/* Progress bar */}
            <div
              className="ml-10 h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--color-surface-2)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: cat.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
