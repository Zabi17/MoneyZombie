import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { format, subMonths, startOfMonth } from "date-fns";

export function useReports(monthsBack = 6) {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);

  return useMemo(() => {
    // Build last N months array
    const months = Array.from({ length: monthsBack }, (_, i) => {
      const d = subMonths(startOfMonth(new Date()), monthsBack - 1 - i);
      return format(d, "yyyy-MM");
    });

    // Monthly totals
    const monthly = months.map((month) => {
      const monthTxs = transactions.filter((t) => t.date.startsWith(month));
      const income = monthTxs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const expense = monthTxs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      const net = income - expense;
      return {
        month,
        label: format(new Date(month + "-01"), "MMM yy"),
        income,
        expense,
        net,
      };
    });

    // All-time category totals (expenses only)
    const categoryTotals = categories
      .filter((c) => c.type === "expense")
      .map((c) => ({
        ...c,
        total: transactions
          .filter((t) => t.categoryId === c.id && t.type === "expense")
          .reduce((s, t) => s + t.amount, 0),
      }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    const grandTotal = categoryTotals.reduce((s, c) => s + c.total, 0);

    // Biggest single expense
    const biggestExpense =
      transactions
        .filter((t) => t.type === "expense")
        .sort((a, b) => b.amount - a.amount)[0] ?? null;

    // Avg monthly expense
    const filledMonths = monthly.filter((m) => m.expense > 0).length || 1;
    const totalExpenses = monthly.reduce((s, m) => s + m.expense, 0);
    const avgMonthly = totalExpenses / filledMonths;

    // Savings rate (last full month)
    const lastMonth = monthly[monthly.length - 1];
    const savingsRate =
      lastMonth.income > 0
        ? ((lastMonth.income - lastMonth.expense) / lastMonth.income) * 100
        : 0;

    return {
      monthly,
      categoryTotals,
      grandTotal,
      biggestExpense,
      avgMonthly,
      savingsRate,
      lastMonth,
    };
  }, [transactions, categories, monthsBack]);
}
