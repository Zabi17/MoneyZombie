import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { useAppStore } from "../../store/useAppStore";
import { useCurrency } from "../../hooks/useCurrency";
import { format } from "date-fns";
import { DateRangePicker, type DateRange } from "./DateRangePicker";

const CURRENCY_FORMATS: Record<string, string> = {
  INR: '"₹"#,##0.00',
  USD: '"$"#,##0.00',
  EUR: '"€"#,##0.00',
  GBP: '"£"#,##0.00',
};

const DEFAULT_RANGE: DateRange = { label: "All Time", start: null, end: null };

export function ExportButton() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const budgets = useAppStore((s) => s.budgets);
  const savingsPots = useAppStore((s) => s.savingsPots);
  const lends = useAppStore((s) => s.lends);
  const { code } = useCurrency();
  const [isExporting, setIsExporting] = useState(false);
  const [range, setRange] = useState<DateRange>(DEFAULT_RANGE);

  const numberFormat = CURRENCY_FORMATS[code] ?? "#,##0.00";

  const inRange = (date: string) => {
    if (range.start && date < range.start) return false;
    if (range.end && date > range.end) return false;
    return true;
  };

  const applyCurrencyFormat = (
    worksheet: XLSX.WorkSheet,
    column: string,
    rowCount: number,
    startRow = 2,
  ) => {
    for (let r = startRow; r <= rowCount + 1; r++) {
      const cellRef = `${column}${r}`;
      if (worksheet[cellRef]) {
        worksheet[cellRef].z = numberFormat;
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));

      const filteredTx = transactions.filter((t) => inRange(t.date));
      const filteredLends = (lends ?? []).filter((l) => inRange(l.lentOn));
      // Budgets are month-scoped (e.g. "2026-07"), so compare against the range boundaries' month
      const filteredBudgets = (budgets ?? []).filter((b) => {
        const monthAsDate = `${b.month}-01`;
        return inRange(monthAsDate);
      });

      const workbook = XLSX.utils.book_new();

      const totalIncome = filteredTx
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = filteredTx
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      const netBalance = totalIncome - totalExpense;
      const totalSavings = (savingsPots ?? []).reduce(
        (sum, p) => sum + p.currentAmount,
        0,
      );
      const outstandingLends = filteredLends
        .filter((l) => !l.settledOn)
        .reduce((sum, l) => sum + l.amount, 0);

      const summaryRows = [
        { Metric: "Range", Amount: range.label },
        { Metric: "Total Income", Amount: totalIncome },
        { Metric: "Total Expense", Amount: totalExpense },
        { Metric: "Net Balance", Amount: netBalance },
        { Metric: "Total Savings", Amount: totalSavings },
        { Metric: "Outstanding Lends", Amount: outstandingLends },
        { Metric: "", Amount: "" },
        { Metric: "Generated On", Amount: format(new Date(), "yyyy-MM-dd") },
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
      summarySheet["!cols"] = [{ wch: 22 }, { wch: 18 }];
      applyCurrencyFormat(summarySheet, "B", 5, 3); // rows 3-7: Income, Expense, Net, Savings, Lends
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      const txRows = [...filteredTx]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((t) => {
          const cat = categories.find((c) => c.id === t.categoryId);
          return {
            Date: t.date,
            Title: t.title,
            Type: t.type,
            Category: cat?.name ?? "Unknown",
            Amount: t.amount,
            Currency: code,
            Note: t.note ?? "",
          };
        });

      const txSheet = XLSX.utils.json_to_sheet(txRows);
      txSheet["!cols"] = [
        { wch: 12 },
        { wch: 24 },
        { wch: 10 },
        { wch: 16 },
        { wch: 12 },
        { wch: 10 },
        { wch: 30 },
      ];
      applyCurrencyFormat(txSheet, "E", txRows.length);
      XLSX.utils.book_append_sheet(workbook, txSheet, "Transactions");

      if (filteredBudgets.length > 0) {
        const budgetRows = [...filteredBudgets]
          .sort((a, b) => b.month.localeCompare(a.month))
          .map((b) => {
            const cat = categories.find((c) => c.id === b.categoryId);
            return {
              Month: b.month,
              Category: cat?.name ?? "Unknown",
              "Budget Amount": b.amount,
              Currency: code,
            };
          });

        const budgetSheet = XLSX.utils.json_to_sheet(budgetRows);
        budgetSheet["!cols"] = [
          { wch: 12 },
          { wch: 20 },
          { wch: 16 },
          { wch: 10 },
        ];
        applyCurrencyFormat(budgetSheet, "C", budgetRows.length);
        XLSX.utils.book_append_sheet(workbook, budgetSheet, "Budgets");
      }

      if (savingsPots && savingsPots.length > 0) {
        const savingsRows = savingsPots.map((p) => ({
          Name: p.name,
          Type: p.type,
          "Current Amount": p.currentAmount,
          "Target Amount": p.targetAmount ?? "",
          Status: p.isCompleted ? "Completed" : "In Progress",
          Currency: code,
        }));

        const savingsSheet = XLSX.utils.json_to_sheet(savingsRows);
        savingsSheet["!cols"] = [
          { wch: 20 },
          { wch: 12 },
          { wch: 16 },
          { wch: 16 },
          { wch: 14 },
          { wch: 10 },
        ];
        applyCurrencyFormat(savingsSheet, "C", savingsRows.length);
        applyCurrencyFormat(savingsSheet, "D", savingsRows.length);
        XLSX.utils.book_append_sheet(workbook, savingsSheet, "Savings");
      }

      if (filteredLends.length > 0) {
        const lendRows = [...filteredLends]
          .sort((a, b) => b.lentOn.localeCompare(a.lentOn))
          .map((l) => {
            const cat = categories.find((c) => c.id === l.categoryId);
            return {
              Title: l.title,
              Category: cat?.name ?? "Unknown",
              Amount: l.amount,
              "Lent On": l.lentOn,
              "Settled On": l.settledOn ?? "",
              Status: l.settledOn ? "Settled" : "Outstanding",
              Note: l.note ?? "",
              Currency: code,
            };
          });

        const lendSheet = XLSX.utils.json_to_sheet(lendRows);
        lendSheet["!cols"] = [
          { wch: 20 },
          { wch: 16 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
          { wch: 30 },
          { wch: 10 },
        ];
        applyCurrencyFormat(lendSheet, "C", lendRows.length);
        XLSX.utils.book_append_sheet(workbook, lendSheet, "Lends");
      }

      const rangeSuffix =
        range.label === "All Time"
          ? "all-time"
          : `${range.start}_to_${range.end}`;

      XLSX.writeFile(workbook, `MoneyZombie-export-${rangeSuffix}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DateRangePicker value={range} onChange={setRange} />
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      >
        {isExporting ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Download size={15} />
        )}
        {isExporting ? "Exporting..." : "Export Excel"}
      </button>
    </div>
  );
}
