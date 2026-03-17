import { Download } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { useCurrency } from "../../hooks/useCurrency";
import { format } from "date-fns";

export function ExportButton() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const settings = useAppStore((s) => s.settings);
  const { code } = useCurrency();

  const handleExport = () => {
    const headers = [
      "Date",
      "Title",
      "Type",
      "Category",
      "Amount",
      "Currency",
      "Note",
    ];

    const rows = [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return [
          t.date,
          `"${t.title.replace(/"/g, '""')}"`,
          t.type,
          cat?.name ?? "Unknown",
          t.amount,
          code,
          `"${(t.note ?? "").replace(/"/g, '""')}"`,
        ].join(",");
      });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `xpns-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-primary)",
      }}
    >
      <Download size={15} />
      Export CSV
    </button>
  );
}
