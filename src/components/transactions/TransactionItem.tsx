import { Transaction } from "../../types";
import { useAppStore } from "../../store/useAppStore";
import { useCurrency } from "../../hooks/useCurrency";
import { format } from "date-fns";
import * as Icons from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  tx: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onMarkReturned?: (id: string) => void;
};

export function TransactionItem({
  tx,
  onEdit,
  onDelete,
  onMarkReturned,
}: Props) {
  const categories = useAppStore((s) => s.categories);
  const { format: fmt } = useCurrency();
  const cat = categories.find((c) => c.id === tx.categoryId);
  const IconComp = cat
    ? ((Icons as any)[cat.icon] ?? Icons.CircleDot)
    : Icons.CircleDot;

  const isLendReturn = tx.type === "lend_return";
  const isPendingLend = tx.is_lend && tx.lend_status === "pending";
  const isReturnedLend = tx.is_lend && tx.lend_status === "returned";

  const amountColor = isLendReturn
    ? "var(--color-income)"
    : tx.is_lend
      ? "var(--color-warning, #f59e0b)"
      : tx.type === "expense"
        ? "var(--color-expense)"
        : "var(--color-income)";

  const amountPrefix = isLendReturn
    ? "+"
    : tx.type === "expense" || tx.is_lend
      ? "-"
      : "+";

  return (
    <div style={{ borderRadius: "1rem", overflow: "hidden" }}>
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 group"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderBottom:
            isPendingLend || isReturnedLend || isLendReturn
              ? "none"
              : "1px solid var(--color-border)",
          borderRadius:
            isPendingLend || isReturnedLend || isLendReturn
              ? "1rem 1rem 0 0"
              : "1rem",
        }}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: cat ? `${cat.color}20` : "var(--color-surface-2)",
            color: cat?.color ?? "var(--color-text-muted)",
          }}
        >
          <IconComp size={18} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {tx.title}
          </p>
          <p
            className="text-xs truncate"
            style={{ color: "var(--color-text-muted)" }}
          >
            {cat?.name} · {format(new Date(tx.date), "MMM d, yyyy")}
            {tx.note && ` · ${tx.note}`}
          </p>
        </div>

        {/* Amount */}
        <span
          className="text-sm font-bold shrink-0"
          style={{ color: amountColor }}
        >
          {amountPrefix}
          {fmt(tx.amount)}
        </span>

        {/* Actions */}
        <div className="flex gap-1 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 lg:transition-opacity lg:duration-150">
          <button
            onClick={() => onEdit(tx)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-secondary)",
            }}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(tx)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
            style={{
              background: "var(--color-expense)18",
              color: "var(--color-expense)",
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Lend status bar */}
      {isPendingLend && (
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderTop: "none",
            borderRadius: "0 0 1rem 1rem",
          }}
        >
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            🕐 Lent to{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {tx.lend_to ?? "someone"}
            </strong>{" "}
            · pending
          </span>
          {onMarkReturned && (
            <button
              onClick={() => onMarkReturned(tx.id)}
              className="text-xs font-bold transition-opacity hover:opacity-70"
              style={{ color: "var(--color-accent)" }}
            >
              Mark returned ↩
            </button>
          )}
        </div>
      )}

      {isReturnedLend && (
        <div
          className="px-4 py-2"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderTop: "none",
            borderRadius: "0 0 1rem 1rem",
          }}
        >
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            ✅ Returned by{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {tx.lend_to ?? "someone"}
            </strong>
          </span>
        </div>
      )}

      {isLendReturn && (
        <div
          className="px-4 py-2"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderTop: "none",
            borderRadius: "0 0 1rem 1rem",
          }}
        >
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            ↩{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {tx.lend_to ?? "Someone"}
            </strong>{" "}
            returned this
          </span>
        </div>
      )}
    </div>
  );
}
