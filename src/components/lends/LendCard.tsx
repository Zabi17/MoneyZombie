import { useState } from "react";
import { Lend, LendPayment } from "../../types";
import { useAppStore } from "../../store/useAppStore";
import { useCurrency } from "../../hooks/useCurrency";
import { differenceInDays, format } from "date-fns";
import * as Icons from "lucide-react";
import { Trash2, Pencil, ChevronDown, Plus } from "lucide-react";

type Props = {
  lend: Lend;
  payments: LendPayment[];
  onLogPayment: (id: string) => void;
  onRemovePayment: (paymentId: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function LendCard({
  lend,
  payments,
  onLogPayment,
  onRemovePayment,
  onEdit,
  onDelete,
}: Props) {
  const categories = useAppStore((s) => s.categories);
  const { format: fmt } = useCurrency();
  const [expanded, setExpanded] = useState(false);

  const cat = categories.find((c) => c.id === lend.categoryId);
  const IconComp = cat
    ? ((Icons as any)[cat.icon] ?? Icons.CircleDot)
    : Icons.CircleDot;

  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(Math.round((lend.amount - paid) * 100) / 100, 0);
  const pct = Math.min((paid / lend.amount) * 100, 100);
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
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: cat ? `${cat.color}20` : "var(--color-surface-2)",
            color: cat?.color ?? "var(--color-text-muted)",
          }}
        >
          <IconComp size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {lend.title}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {isSettled
              ? `Settled ${format(new Date(lend.settledOn!), "MMM d, yyyy")}`
              : `Since ${format(new Date(lend.lentOn), "MMM d, yyyy")} · ${daysOut}d out`}
          </p>
        </div>
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

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--color-surface-2)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: isSettled
                ? "var(--color-income)"
                : "var(--color-accent)",
            }}
          />
        </div>
      </div>

      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: "var(--color-surface-2)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {isSettled ? (
          <span
            className="text-xs font-medium"
            style={{ color: "var(--color-income)" }}
          >
            ✓ Fully settled
          </span>
        ) : (
          <span
            className="text-xs font-medium"
            style={{ color: isOverdue ? "#f59e0b" : "var(--color-text-muted)" }}
          >
            {fmt(paid)} paid · {fmt(remaining)} left
          </span>
        )}
        <div className="flex items-center gap-2">
          {!isSettled && (
            <button
              onClick={() => onLogPayment(lend.id)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-income)20",
                color: "var(--color-income)",
              }}
            >
              <Plus size={11} /> Payment
            </button>
          )}
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
      </div>

      {/* Payment history dropdown */}
      {payments.length > 0 && (
        <div style={{ borderTop: "1px solid var(--color-border)" }}>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span>
              {payments.length} payment{payments.length > 1 ? "s" : ""}
            </span>
            <ChevronDown
              size={14}
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>
          {expanded && (
            <div className="px-4 pb-3 space-y-1.5">
              {payments
                .slice()
                .sort((a, b) => b.paidOn.localeCompare(a.paidOn))
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: "var(--color-surface-2)" }}
                  >
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {fmt(p.amount)}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {format(new Date(p.paidOn), "MMM d, yyyy")}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemovePayment(p.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: "var(--color-expense)18",
                        color: "var(--color-expense)",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
