import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useAppStore, isLendTxTitle } from "../store/useAppStore";
import { Transaction, TransactionType, Lend, LendDirection } from "../types";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { TransactionItem } from "../components/transactions/TransactionItem";
import { DeleteDialog } from "../components/transactions/DeleteDialog";
import { FilterBar } from "../components/transactions/FilterBar";
import { LendForm } from "../components/lends/LendForm";
import { LendCard } from "../components/lends/LendCard";
import { LendPaymentDrawer } from "../components/lends/LendPaymentDrawer";
import { format, isThisYear } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

type LendTab = "all" | LendDirection;

const LEND_TABS: { value: LendTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lent", label: "I lent" },
  { value: "borrowed", label: "I borrowed" },
];

export default function Transactions() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const lends = useAppStore((s) => s.lends);
  const lendPayments = useAppStore((s) => s.lendPayments);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);
  const deleteLend = useAppStore((s) => s.deleteLend);
  const removeLendPayment = useAppStore((s) => s.removeLendPayment);

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
  const [lendTab, setLendTab] = useState<LendTab>("all");

  // Payment drawer state
  const [payingLend, setPayingLend] = useState<Lend | null>(null);
  const [payDrawerOpen, setPayDrawerOpen] = useState(false);

  const isLendsView = typeFilter === "lends";
  const { format: fmt } = useCurrency();

  const filtered = useMemo(() => {
    if (isLendsView) return [];
    return transactions.filter((tx) => {
      const matchSearch = tx.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = !catFilter || tx.categoryId === catFilter;
      let matchType: boolean;
      if (typeFilter === "all") {
        matchType = tx.type !== "transfer" || isLendTxTitle(tx.title);
      } else {
        matchType = tx.type === typeFilter;
      }
      return matchSearch && matchType && matchCat;
    });
  }, [transactions, search, typeFilter, catFilter, isLendsView]);

  const filteredLends = useMemo(() => {
    if (!isLendsView) return [];
    return lends.filter(
      (l) =>
        (lendTab === "all" || (l.direction ?? "lent") === lendTab) &&
        l.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [lends, search, isLendsView, lendTab]);

  const pendingLends = useMemo(
    () => lends.filter((l) => !l.settledOn),
    [lends],
  );

  // Outstanding balances, split by direction
  const { owedToYou, youOwe } = useMemo(() => {
    const paidByLend = new Map<string, number>();
    lendPayments.forEach((p) =>
      paidByLend.set(p.lendId, (paidByLend.get(p.lendId) ?? 0) + p.amount),
    );

    let owed = 0;
    let owe = 0;
    pendingLends.forEach((l) => {
      const remaining = Math.max(l.amount - (paidByLend.get(l.id) ?? 0), 0);
      if (l.direction === "borrowed") owe += remaining;
      else owed += remaining;
    });

    return {
      owedToYou: Math.round(owed * 100) / 100,
      youOwe: Math.round(owe * 100) / 100,
    };
  }, [pendingLends, lendPayments]);

  const net = Math.round((owedToYou - youOwe) * 100) / 100;

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

  // A lend-linked transaction is: the opening tx, OR any payment tx.
  const findLendForTx = (txId: string): Lend | undefined => {
    const byDebit = lends.find((l) => l.walletDebitTxId === txId);
    if (byDebit) return byDebit;
    const payment = lendPayments.find((p) => p.txId === txId);
    if (payment) return lends.find((l) => l.id === payment.lendId);
    return undefined;
  };

  const handleTxEdit = (tx: Transaction) => {
    if (isLendTxTitle(tx.title)) {
      const linked = findLendForTx(tx.id);
      if (linked) {
        const isOpening = linked.walletDebitTxId === tx.id;
        if (isOpening) {
          setEditingLend(linked);
          setLendFormOpen(true);
        } else {
          setPayingLend(linked);
          setPayDrawerOpen(true);
        }
        return;
      }
    }
    setEditingTx(tx);
    setTxFormOpen(true);
  };

  const handleTxDelete = (tx: Transaction) => {
    if (isLendTxTitle(tx.title)) {
      const linked = findLendForTx(tx.id);
      if (linked) {
        const isOpening = linked.walletDebitTxId === tx.id;
        if (isOpening) {
          // Deleting the opening tx deletes the whole entry
          setDeletingLendId(linked.id);
        } else {
          // Deleting a payment tx removes just that payment
          const payment = lendPayments.find((p) => p.txId === tx.id);
          if (payment) removeLendPayment(payment.id);
        }
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
            {isLendsView ? "Lends & Borrows" : "Transactions"}
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
          <Plus size={16} /> {isLendsView ? "New" : "Add"}
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
          {/* Direction tabs */}
          <div
            className="grid grid-cols-3 gap-1 p-1 rounded-xl"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            {LEND_TABS.map((t) => {
              const active = lendTab === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setLendTab(t.value)}
                  className="py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                  style={{
                    background: active ? "var(--color-accent)" : "transparent",
                    color: active ? "black" : "var(--color-text-secondary)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Summary */}
          {pendingLends.length > 0 && (
            <div
              className="grid grid-cols-3 gap-2 px-4 py-3 rounded-xl"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  You're owed
                </p>
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--color-income)" }}
                >
                  {fmt(owedToYou)}
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  You owe
                </p>
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--color-expense)" }}
                >
                  {fmt(youOwe)}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Net
                </p>
                <p
                  className="text-sm font-bold"
                  style={{
                    color:
                      net >= 0 ? "var(--color-income)" : "var(--color-expense)",
                  }}
                >
                  {net >= 0 ? "+" : "-"}
                  {fmt(Math.abs(net))}
                </p>
              </div>
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
                {lendTab === "borrowed"
                  ? "No borrowings yet"
                  : lendTab === "lent"
                    ? "No lends yet"
                    : "Nothing recorded yet"}
              </p>
              <button
                onClick={() => {
                  setEditingLend(null);
                  setLendFormOpen(true);
                }}
                className="text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--color-accent)" }}
              >
                Record your first entry →
              </button>
            </div>
          ) : (
            filteredLends.map((lend) => (
              <LendCard
                key={lend.id}
                lend={lend}
                payments={lendPayments.filter((p) => p.lendId === lend.id)}
                onLogPayment={(id) => {
                  const l = lends.find((x) => x.id === id);
                  if (l) {
                    setPayingLend(l);
                    setPayDrawerOpen(true);
                  }
                }}
                onRemovePayment={removeLendPayment}
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

      {/* Payment drawer */}
      <LendPaymentDrawer
        open={payDrawerOpen}
        onClose={() => {
          setPayDrawerOpen(false);
          setPayingLend(null);
        }}
        lend={payingLend}
        payments={
          payingLend
            ? lendPayments.filter((p) => p.lendId === payingLend.id)
            : []
        }
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
        title="this entry and its wallet transactions"
        onClose={() => setDeletingLendId(null)}
        onConfirm={() => {
          if (deletingLendId) deleteLend(deletingLendId);
          setDeletingLendId(null);
        }}
      />
    </div>
  );
}