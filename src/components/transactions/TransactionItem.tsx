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
};

export function TransactionItem({ tx, onEdit, onDelete }: Props) {
  const categories = useAppStore((s) => s.categories);
  const { format: fmt } = useCurrency();
  const cat = categories.find((c) => c.id === tx.categoryId);
  const IconComp = cat
    ? ((Icons as any)[cat.icon] ?? Icons.CircleDot)
    : Icons.CircleDot;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl group"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
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
        style={{
          color:
            tx.type === "expense"
              ? "var(--color-expense)"
              : "var(--color-income)",
        }}
      >
        {tx.type === "expense" ? "-" : "+"}
        {fmt(tx.amount)}
      </span>

      {/* Actions — always visible on mobile, hover on desktop */}
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
  );
}
