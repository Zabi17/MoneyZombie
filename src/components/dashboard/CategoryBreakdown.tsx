import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { useTransactionsMulti } from "../../hooks/useTransactions";
import { useCurrency } from "../../hooks/useCurrency";
import { format } from "date-fns";
import * as Icons from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Transaction } from "../../types";

type CatWithSpent = {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
};

type Props = { months?: string[] };

export function CategoryBreakdown({ months }: Props) {
  const categories = useAppStore((s) => s.categories);
  const { expenses, totalExpense } = useTransactionsMulti(months);
  const { format: fmt } = useCurrency();

  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const getCatTransactions = (catId: string): Transaction[] =>
    expenses
      .filter((t) => t.categoryId === catId)
      .sort((a, b) => b.date.localeCompare(a.date));

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
    <div className="space-y-1">
      {breakdown.map((cat) => {
        const IconComp = (Icons as any)[cat.icon] ?? Icons.CircleDot;
        const pct = totalExpense > 0 ? (cat.spent / totalExpense) * 100 : 0;
        const isOpen = expandedId === cat.id;
        const catTxs = isOpen ? getCatTransactions(cat.id) : [];

        return (
          <div
            key={cat.id}
            className="rounded-xl overflow-hidden transition-all duration-200"
            style={{
              background: isOpen ? "var(--color-surface-2)" : "transparent",
              border: `1px solid ${isOpen ? "var(--color-border)" : "transparent"}`,
            }}
          >
            {/* Row — tappable */}
            <button
              onClick={() => setExpandedId(isOpen ? null : cat.id)}
              className="w-full text-left px-3 py-2.5 active:opacity-60 transition-opacity duration-100 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${cat.color}20`, color: cat.color }}
                >
                  <IconComp size={14} />
                </div>
                <span
                  className="text-sm font-medium flex-1 text-left"
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
                  className="text-xs w-8 text-right"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {pct.toFixed(0)}%
                </span>
                <ChevronDown
                  size={14}
                  className="shrink-0 transition-transform duration-200"
                  style={{
                    color: "var(--color-text-muted)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </div>

              {/* Progress bar */}
              <div
                className="ml-10 h-1 rounded-full overflow-hidden"
                style={{ background: "var(--color-border)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: cat.color }}
                />
              </div>
            </button>

            {/* Inline transaction list */}
            {isOpen && (
              <div className="px-3 pb-3 space-y-1.5">
                <div
                  className="h-px mb-3"
                  style={{ background: "var(--color-border)" }}
                />
                {catTxs.length === 0 ? (
                  <p
                    className="text-xs text-center py-2"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    No transactions
                  </p>
                ) : (
                  catTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                      style={{ background: "var(--color-surface)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {tx.title}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {format(new Date(tx.date), "MMM d, yyyy")}
                          {tx.note && ` · ${tx.note}`}
                        </p>
                      </div>
                      <span
                        className="text-sm font-bold shrink-0"
                        style={{ color: "var(--color-expense)" }}
                      >
                        -{fmt(tx.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
