import { useState } from "react";
import { Drawer } from "vaul";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { useAppStore } from "../../store/useAppStore";
import { useCurrency } from "../../hooks/useCurrency";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
} from "date-fns";

type DateRange = { label: string; start: string | null; end: string | null };

const CURRENCY_FORMATS: Record<string, string> = {
  INR: '"₹"#,##0.00',
  USD: '"$"#,##0.00',
  EUR: '"€"#,##0.00',
  GBP: '"£"#,##0.00',
};

export function ExportButton() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const budgets = useAppStore((s) => s.budgets);
  const savingsPots = useAppStore((s) => s.savingsPots);
  const lends = useAppStore((s) => s.lends);
  const { code } = useCurrency();

  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const numberFormat = CURRENCY_FORMATS[code] ?? "#,##0.00";

  const today = new Date();
  const presets: DateRange[] = [
    {
      label: "This Month",
      start: format(startOfMonth(today), "yyyy-MM-dd"),
      end: format(endOfMonth(today), "yyyy-MM-dd"),
    },
    {
      label: "Last Month",
      start: format(startOfMonth(subMonths(today, 1)), "yyyy-MM-dd"),
      end: format(endOfMonth(subMonths(today, 1)), "yyyy-MM-dd"),
    },
    {
      label: "Last 3 Months",
      start: format(startOfMonth(subMonths(today, 2)), "yyyy-MM-dd"),
      end: format(endOfMonth(today), "yyyy-MM-dd"),
    },
    {
      label: "Last 6 Months",
      start: format(startOfMonth(subMonths(today, 5)), "yyyy-MM-dd"),
      end: format(endOfMonth(today), "yyyy-MM-dd"),
    },
    {
      label: "This Year",
      start: format(startOfYear(today), "yyyy-MM-dd"),
      end: format(endOfMonth(today), "yyyy-MM-dd"),
    },
    { label: "All Time", start: null, end: null },
  ];

  const inRange = (date: string, range: DateRange) => {
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
      if (worksheet[cellRef]) worksheet[cellRef].z = numberFormat;
    }
  };

  const runExport = async (range: DateRange) => {
    setOpen(false);
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));

      const filteredTx = transactions.filter((t) => inRange(t.date, range));
      const filteredLends = (lends ?? []).filter((l) =>
        inRange(l.lentOn, range),
      );
      const filteredBudgets = (budgets ?? []).filter((b) =>
        inRange(`${b.month}-01`, range),
      );

      const workbook = XLSX.utils.book_new();

      const totalIncome = filteredTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const totalExpense = filteredTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      const netBalance = totalIncome - totalExpense;
      const totalSavings = (savingsPots ?? []).reduce(
        (s, p) => s + p.currentAmount,
        0,
      );
      const outstandingLends = filteredLends
        .filter((l) => !l.settledOn)
        .reduce((s, l) => s + l.amount, 0);

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
      applyCurrencyFormat(summarySheet, "B", 5, 3);
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

  const handleCustomDownload = () => {
    if (!customStart || !customEnd || customStart > customEnd) return;
    runExport({
      label: `${format(new Date(customStart), "MMM d")} – ${format(
        new Date(customEnd),
        "MMM d, yyyy",
      )}`,
      start: customStart,
      end: customEnd,
    });
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
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
          {isExporting ? "Exporting..." : "Download Excel"}
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 outline-none flex flex-col sm:inset-0 sm:items-center sm:justify-center">
          <div
            className="w-full flex flex-col rounded-t-2xl outline-none max-h-[85vh] sm:max-w-sm sm:max-h-[80vh] sm:rounded-2xl sm:shadow-2xl"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="mx-auto mt-3 h-1.5 w-10 rounded-full shrink-0 sm:hidden"
              style={{ background: "var(--color-border)" }}
            />

            <div className="px-5 pt-4 pb-2">
              <Drawer.Title
                className="text-base font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Download Excel
              </Drawer.Title>
            </div>

            <div className="overflow-y-auto px-5 pb-6 flex flex-col gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => runExport(preset)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:opacity-90"
                  style={{
                    background: "var(--color-background)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {preset.label}
                </button>
              ))}

              <div
                className="mt-3 pt-4"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <p
                  className="text-xs font-semibold mb-2.5 uppercase tracking-wide"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Custom Range
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm"
                    style={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    –
                  </span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm"
                    style={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </div>
                <button
                  onClick={handleCustomDownload}
                  disabled={
                    !customStart || !customEnd || customStart > customEnd
                  }
                  className="w-full mt-3 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-80"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-accent-foreground, white)",
                  }}
                >
                  Download Custom Range
                </button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
