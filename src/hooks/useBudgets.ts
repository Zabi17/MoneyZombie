import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";

export function useBudgets(month: string) {
  const budgets = useAppStore((s) => s.budgets);
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);

  return useMemo(() => {
    return budgets
      .filter((b) => b.month === month)
      .map((b) => {
        const spent = transactions
          .filter(
            (t) =>
              t.categoryId === b.categoryId &&
              t.date.startsWith(month) &&
              t.type === "expense",
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const category = categories.find((c) => c.id === b.categoryId);
        const percent = Math.min((spent / b.amount) * 100, 100);
        const isOver = spent > b.amount;

        return { ...b, spent, category, percent, isOver };
      });
  }, [budgets, transactions, categories, month]);
}
