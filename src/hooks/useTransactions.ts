import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { format, subMonths } from "date-fns";

export type ViewScope = "month" | "month+prev" | "all";

/** Returns the list of "yyyy-MM" strings for a given scope + anchor month */
export function getScopeMonths(
  anchorMonth: string,
  scope: ViewScope,
): string[] | undefined {
  if (scope === "all") return undefined; // undefined = no filter = all time
  if (scope === "month") return [anchorMonth];
  if (scope === "month+prev") {
    const [y, m] = anchorMonth.split("-").map(Number);
    const prev = format(subMonths(new Date(y, m - 1, 1), 1), "yyyy-MM");
    return [prev, anchorMonth];
  }
  return [anchorMonth];
}

export function useTransactions(month?: string) {
  const transactions = useAppStore((s) => s.transactions);

  return useMemo(() => {
    const filtered = month
      ? transactions.filter(
          (t) => t.date.startsWith(month) && t.type !== "transfer",
        )
      : transactions.filter((t) => t.type !== "transfer");

    const expenses = filtered.filter((t) => t.type === "expense");
    const income = filtered.filter((t) => t.type === "income");

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return { filtered, expenses, income, totalExpense, totalIncome, balance };
  }, [transactions, month]);
}

/** Accepts an array of months (or undefined for all-time) */
export function useTransactionsMulti(months?: string[]) {
  const transactions = useAppStore((s) => s.transactions);

  return useMemo(() => {
  const filtered = months
    ? transactions.filter((t) => months.some((m) => t.date.startsWith(m)) && t.type !== "transfer")
    : transactions.filter((t) => t.type !== "transfer");

    const expenses = filtered.filter((t) => t.type === "expense");
    const income = filtered.filter((t) => t.type === "income");

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return { filtered, expenses, income, totalExpense, totalIncome, balance };
  }, [transactions, months]);
}

/** Running balance: sum of ALL transactions up to the end of the given month */
export function useRunningBalance(upToMonth: string) {
  const transactions = useAppStore((s) => s.transactions);

  return useMemo(() => {
    const prior = transactions.filter((t) => t.date.slice(0, 7) <= upToMonth);

    const income = prior
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);

    const expense = prior
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    // Deposits to savings pots deduct from wallet
    // Withdrawals from savings pots add back to wallet
    const savingsDeposits = prior
      .filter((t) => t.type === "transfer" && t.title.startsWith("Saved to"))
      .reduce((s, t) => s + t.amount, 0);

    const savingsWithdrawals = prior
      .filter(
        (t) => t.type === "transfer" && t.title.startsWith("Withdrawn from"),
      )
      .reduce((s, t) => s + t.amount, 0);

    return income - expense - savingsDeposits + savingsWithdrawals;
  }, [transactions, upToMonth]);
}
