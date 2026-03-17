import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { format } from "date-fns";

export function useTransactions(month?: string) {
  const transactions = useAppStore((s) => s.transactions);

  return useMemo(() => {
    const filtered = month
      ? transactions.filter((t) => t.date.startsWith(month))
      : transactions;

    const expenses = filtered.filter((t) => t.type === "expense");
    const income = filtered.filter((t) => t.type === "income");

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return { filtered, expenses, income, totalExpense, totalIncome, balance };
  }, [transactions, month]);
}
