import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { format, subMonths } from "date-fns";

export type ViewScope = "month" | "month+prev" | "all";

export function getScopeMonths(
  anchorMonth: string,
  scope: ViewScope,
): string[] | undefined {
  if (scope === "all") return undefined;
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

export function useTransactionsMulti(months?: string[]) {
  const transactions = useAppStore((s) => s.transactions);

  return useMemo(() => {
    const filtered = months
      ? transactions.filter(
          (t) =>
            months.some((m) => t.date.startsWith(m)) && t.type !== "transfer",
        )
      : transactions.filter((t) => t.type !== "transfer");

    const expenses = filtered.filter((t) => t.type === "expense");
    const income = filtered.filter((t) => t.type === "income");
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return { filtered, expenses, income, totalExpense, totalIncome, balance };
  }, [transactions, months]);
}

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

    const savingsDeposits = prior
      .filter((t) => t.type === "transfer" && t.title.startsWith("Saved to"))
      .reduce((s, t) => s + t.amount, 0);

    const savingsWithdrawals = prior
      .filter(
        (t) => t.type === "transfer" && t.title.startsWith("Withdrawn from"),
      )
      .reduce((s, t) => s + t.amount, 0);

    // Lend debits/credits are already real transfer-type transactions in the wallet
    // so balance is naturally correct without special handling

    return income - expense - savingsDeposits + savingsWithdrawals;
  }, [transactions, upToMonth]);
}
