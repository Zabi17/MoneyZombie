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

    const sumWhere = (pred: (t: (typeof prior)[number]) => boolean) =>
      prior.filter(pred).reduce((s, t) => s + t.amount, 0);

    const isTransfer = (t: (typeof prior)[number]) => t.type === "transfer";

    const income = sumWhere((t) => t.type === "income");
    const expense = sumWhere((t) => t.type === "expense");

    const savingsDeposits = sumWhere(
      (t) => isTransfer(t) && t.title.startsWith("Saved to"),
    );
    const savingsWithdrawals = sumWhere(
      (t) => isTransfer(t) && t.title.startsWith("Withdrawn from"),
    );

    // Lent: money out, then back in
    const lendDebits = sumWhere(
      (t) => isTransfer(t) && t.title.startsWith("Lent ·"),
    );
    const lendReturns = sumWhere(
      (t) => isTransfer(t) && t.title.startsWith("Returned ·"),
    );

    // Borrowed: money in, then back out
    const borrowCredits = sumWhere(
      (t) => isTransfer(t) && t.title.startsWith("Borrowed ·"),
    );
    const borrowRepayments = sumWhere(
      (t) => isTransfer(t) && t.title.startsWith("Repaid ·"),
    );

    const balance =
      income -
      expense -
      savingsDeposits +
      savingsWithdrawals -
      lendDebits +
      lendReturns +
      borrowCredits -
      borrowRepayments;

    return Math.round(balance * 100) / 100;
  }, [transactions, upToMonth]);
}

export function useSavingsBalance(upToMonth: string) {
  const transactions = useAppStore((s) => s.transactions);

  return useMemo(() => {
    const prior = transactions.filter((t) => t.date.slice(0, 7) <= upToMonth);

    const savingsDeposits = prior
      .filter((t) => t.type === "transfer" && t.title.startsWith("Saved to"))
      .reduce((s, t) => s + t.amount, 0);

    const savingsWithdrawals = prior
      .filter(
        (t) => t.type === "transfer" && t.title.startsWith("Withdrawn from"),
      )
      .reduce((s, t) => s + t.amount, 0);

    return savingsDeposits - savingsWithdrawals;
  }, [transactions, upToMonth]);
}