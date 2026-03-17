import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Transaction, TransactionType } from "../types";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { TransactionItem } from "../components/transactions/TransactionItem";
import { DeleteDialog } from "../components/transactions/DeleteDialog";
import { FilterBar } from "../components/transactions/FilterBar";
import { format, isThisYear } from "date-fns";

export default function Transactions() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [catFilter, setCatFilter] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch = tx.title.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || tx.type === typeFilter;
      const matchCat = !catFilter || tx.categoryId === catFilter;
      return matchSearch && matchType && matchCat;
    });
  }, [transactions, search, typeFilter, catFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filtered.forEach((tx) => {
      const key = tx.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    });
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const formatGroupDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === format(today, "yyyy-MM-dd")) return "Today";
    if (dateStr === format(yesterday, "yyyy-MM-dd")) return "Yesterday";
    return format(d, isThisYear(d) ? "MMMM d" : "MMMM d, yyyy");
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setFormOpen(true);
  };
  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-widest mb-0.5"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            {filtered.length} entries
          </p>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Transactions
          </h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
          style={{
            background: "var(--color-accent)",
            color: "black",
            fontFamily: "var(--font-display)",
          }}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        typeFilter={typeFilter}
        onTypeFilter={setTypeFilter}
        categoryFilter={catFilter}
        onCategoryFilter={setCatFilter}
        categories={categories}
      />

      {/* List */}
      {grouped.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
          style={{ border: "1px dashed var(--color-border)" }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            {search || catFilter || typeFilter !== "all"
              ? "No matching transactions"
              : "No transactions yet"}
          </p>
          {!search && !catFilter && typeFilter === "all" && (
            <button
              onClick={openAdd}
              className="text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--color-accent)" }}
            >
              Add your first transaction →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2 px-1"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {formatGroupDate(date)}
              </p>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    onEdit={openEdit}
                    onDelete={setDeleting}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form drawer */}
      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />

      {/* Delete confirm */}
      <DeleteDialog
        open={!!deleting}
        title={deleting?.title}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteTransaction(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
