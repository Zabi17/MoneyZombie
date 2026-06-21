import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Transaction, TransactionType, Lend } from "../types";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { TransactionItem } from "../components/transactions/TransactionItem";
import { DeleteDialog } from "../components/transactions/DeleteDialog";
import { FilterBar } from "../components/transactions/FilterBar";
import { LendForm } from "../components/lends/LendForm";
import { LendCard } from "../components/lends/LendCard";
import { format, isThisYear } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

export default function Transactions() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const lends = useAppStore((s) => s.lends);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);
  const deleteLend = useAppStore((s) => s.deleteLend);
  const settleLend = useAppStore((s) => s.settleLend);
  const undoSettleLend = useAppStore((s) => s.undoSettleLend);

  const [txFormOpen, setTxFormOpen] = useState(false);
  const [lendFormOpen, setLendFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingLend, setEditingLend] = useState<Lend | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [deletingLendId, setDeletingLendId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    TransactionType | "all" | "lends"
  >("all");

  const isLendsView = typeFilter === "lends";
  const { format: fmt } = useCurrency();

  const filtered = useMemo(() => {
    if (isLendsView) return [];
    return transactions.filter((tx) => {
      const matchSearch = tx.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = !catFilter || tx.categoryId === catFilter;
      let matchType: boolean;
      if (typeFilter === "all") {
        matchType =
          tx.type !== "transfer" ||
          tx.title.startsWith("Lent ·") ||
          tx.title.startsWith("Returned ·");
      } else {
        matchType = tx.type === typeFilter;
      }
      return matchSearch && matchType && matchCat;
    });
  }, [transactions, search, typeFilter, catFilter, isLendsView]);

  const filteredLends = useMemo(() => {
    if (!isLendsView) return [];
    return lends.filter((l) =>
      l.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [lends, search, isLendsView]);

  const pendingLends = lends.filter((l) => !l.settledOn);
  const pendingTotal = pendingLends.reduce((s, l) => s + l.amount, 0);

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

  const handleTxEdit = (tx: Transaction) => {
    const isLendTx =
      tx.title.startsWith("Lent ·") || tx.title.startsWith("Returned ·");
    if (isLendTx) {
      const linked = lends.find(
        (l) => l.walletDebitTxId === tx.id || l.walletCreditTxId === tx.id,
      );
      if (linked) {
        setEditingLend(linked);
        setLendFormOpen(true);
        return;
      }
    }
    setEditingTx(tx);
    setTxFormOpen(true);
  };

  const handleTxDelete = (tx: Transaction) => {
    const isLendTx =
      tx.title.startsWith("Lent ·") || tx.title.startsWith("Returned ·");
    if (isLendTx) {
      const linked = lends.find(
        (l) => l.walletDebitTxId === tx.id || l.walletCreditTxId === tx.id,
      );
      if (linked) {
        setDeletingLendId(linked.id);
        return;
      }
    }
    setDeleting(tx);
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
            {isLendsView
              ? `${pendingLends.length} pending`
              : `${filtered.length} entries`}
          </p>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            {isLendsView ? "Lends" : "Transactions"}
          </h1>
        </div>
        <button
          onClick={() => {
            if (isLendsView) {
              setEditingLend(null);
              setLendFormOpen(true);
            } else {
              setEditingTx(null);
              setTxFormOpen(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
          style={{
            background: "var(--color-accent)",
            color: "black",
            fontFamily: "var(--font-display)",
          }}
        >
          <Plus size={16} /> {isLendsView ? "Lend" : "Add"}
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

      {/* Lends view */}
      {isLendsView ? (
        <div className="space-y-3">
          {pendingLends.length > 0 && (
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                {pendingLends.length} pending
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--color-expense)" }}
              >
                -{fmt(pendingTotal)}
              </span>
            </div>
          )}

          {filteredLends.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
              style={{ border: "1px dashed var(--color-border)" }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                No lends yet
              </p>
              <button
                onClick={() => {
                  setEditingLend(null);
                  setLendFormOpen(true);
                }}
                className="text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--color-accent)" }}
              >
                Record your first lend →
              </button>
            </div>
          ) : (
            filteredLends.map((lend) => (
              <LendCard
                key={lend.id}
                lend={lend}
                onSettle={settleLend}
                onUndo={undoSettleLend}
                onEdit={(id) => {
                  const l = lends.find((x) => x.id === id);
                  if (l) {
                    setEditingLend(l);
                    setLendFormOpen(true);
                  }
                }}
                onDelete={(id) => setDeletingLendId(id)}
              />
            ))
          )}
        </div>
      ) : grouped.length === 0 ? (
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
              onClick={() => {
                setEditingTx(null);
                setTxFormOpen(true);
              }}
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
                    onEdit={handleTxEdit}
                    onDelete={handleTxDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction form — with lend toggle */}
      <TransactionForm
        open={txFormOpen}
        onClose={() => {
          setTxFormOpen(false);
          setEditingTx(null);
        }}
        editing={editingTx}
        onSwitchToLend={() => {
          setTxFormOpen(false);
          setEditingLend(null);
          setLendFormOpen(true);
        }}
      />

      {/* Lend form */}
      <LendForm
        open={lendFormOpen}
        onClose={() => {
          setLendFormOpen(false);
          setEditingLend(null);
        }}
        editing={editingLend}
      />

      {/* Delete tx confirm */}
      <DeleteDialog
        open={!!deleting}
        title={deleting?.title}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteTransaction(deleting.id);
          setDeleting(null);
        }}
      />

      {/* Delete lend confirm */}
      <DeleteDialog
        open={!!deletingLendId}
        title="this lend and its wallet transactions"
        onClose={() => setDeletingLendId(null)}
        onConfirm={() => {
          if (deletingLendId) deleteLend(deletingLendId);
          setDeletingLendId(null);
        }}
      />
    </div>
  );
}
