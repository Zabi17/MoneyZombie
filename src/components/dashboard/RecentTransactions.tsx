import { useAppStore } from "../../store/useAppStore";
import { useCurrency } from "../../hooks/useCurrency";
import { format } from "date-fns";
import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function RecentTransactions() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const { format: fmt } = useCurrency();

  const recent = transactions.slice(0, 6);

  if (recent.length === 0) {
    return (
      <p
        className="text-sm py-4 text-center"
        style={{ color: "var(--color-text-muted)" }}
      >
        No transactions yet
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {recent.map((tx) => {
        const cat = categories.find((c) => c.id === tx.categoryId);
        const IconComp = cat
          ? ((Icons as any)[cat.icon] ?? Icons.CircleDot)
          : Icons.CircleDot;
        const isExpense = tx.type === "expense";

        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 hover:opacity-80"
            style={{ background: "var(--color-surface-2)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: cat ? `${cat.color}20` : "var(--color-surface)",
                color: cat?.color ?? "var(--color-text-muted)",
              }}
            >
              <IconComp size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--color-text-primary)" }}
              >
                {tx.title}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                {cat?.name} · {format(new Date(tx.date), "MMM d")}
              </p>
            </div>
            <span
              className="text-sm font-semibold shrink-0"
              style={{
                color: isExpense
                  ? "var(--color-expense)"
                  : "var(--color-income)",
              }}
            >
              {isExpense ? "-" : "+"}
              {fmt(tx.amount)}
            </span>
          </div>
        );
      })}

      <Link
        to="/transactions"
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium mt-2 transition-opacity hover:opacity-70"
        style={{ color: "var(--color-accent)" }}
      >
        View all transactions <ArrowRight size={14} />
      </Link>
    </div>
  );
}
