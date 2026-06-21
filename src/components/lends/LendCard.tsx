import { Lend } from "../../types";
import { useAppStore } from "../../store/useAppStore";
import { useCurrency } from "../../hooks/useCurrency";
import { differenceInDays, format } from "date-fns";
import * as Icons from "lucide-react";
import { Trash2, RotateCcw, Pencil } from "lucide-react";

type Props = {
  lend: Lend;
  onSettle: (id: string) => void;
  onUndo: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function LendCard({ lend, onSettle, onUndo, onEdit, onDelete }: Props) {
  const categories = useAppStore((s) => s.categories);
  const { format: fmt } = useCurrency();

  const cat = categories.find((c) => c.id === lend.categoryId);
  const IconComp = cat
    ? ((Icons as any)[cat.icon] ?? Icons.CircleDot)
    : Icons.CircleDot;

  const isSettled = !!lend.settledOn;
  const daysOut = differenceInDays(new Date(), new Date(lend.lentOn));
  const isOverdue = !isSettled && daysOut > 30;

  const accentColor = isSettled
    ? "var(--color-income)"
    : isOverdue
      ? "#f59e0b"
      : "var(--color-text-muted)";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1px solid var(--color-border)",
        borderLeft: `3px solid ${accentColor}`,
        background: "var(--color-surface)",
      }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
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
            {lend.title}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {isSettled
              ? `${format(new Date(lend.lentOn), "MMM d")} → ${format(new Date(lend.settledOn!), "MMM d, yyyy")} · ${differenceInDays(new Date(lend.settledOn!), new Date(lend.lentOn))}d`
              : `Since ${format(new Date(lend.lentOn), "MMM d, yyyy")} · ${daysOut}d out`}
          </p>
        </div>

        {/* Amount */}
        <span
          className="text-sm font-bold shrink-0"
          style={{
            color: isSettled ? "var(--color-income)" : "var(--color-expense)",
          }}
        >
          {isSettled ? "" : "-"}
          {fmt(lend.amount)}
        </span>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: "var(--color-surface-2)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {isSettled ? (
          <>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-income)" }}
            >
              ✓ Settled
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUndo(lend.id)}
                className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-text-muted)" }}
              >
                <RotateCcw size={11} /> Undo
              </button>
              <button
                onClick={() => onEdit(lend.id)}
                className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Pencil size={11} /> Edit
              </button>
              <button
                onClick={() => onDelete(lend.id)}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                style={{
                  background: "var(--color-expense)18",
                  color: "var(--color-expense)",
                }}
              >
                <Trash2 size={11} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span
              className="text-xs font-medium"
              style={{
                color: isOverdue ? "#f59e0b" : "var(--color-text-muted)",
              }}
            >
              {isOverdue ? `⚠ ${daysOut}d — overdue` : "Pending"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSettle(lend.id)}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
                style={{
                  background: "var(--color-income)20",
                  color: "var(--color-income)",
                }}
              >
                Mark settled ↩
              </button>
              <button
                onClick={() => onEdit(lend.id)}
                className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Pencil size={11} /> Edit
              </button>
              <button
                onClick={() => onDelete(lend.id)}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                style={{
                  background: "var(--color-expense)18",
                  color: "var(--color-expense)",
                }}
              >
                <Trash2 size={11} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
