import { useState } from "react";
import * as Icons from "lucide-react";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useCurrency } from "../../hooks/useCurrency";

type Props = {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  percent: number;
  isOver: boolean;
  category?: { name: string; icon: string; color: string };
  onEdit: () => void;
  onDelete: () => void;
};

export function BudgetCard({
  amount,
  spent,
  percent,
  isOver,
  category,
  onEdit,
  onDelete,
}: Props) {
  const { format: fmt } = useCurrency();
  const IconComp = category
    ? ((Icons as any)[category.icon] ?? Icons.CircleDot)
    : Icons.CircleDot;
  const remaining = amount - spent;
  const color = isOver
    ? "var(--color-expense)"
    : percent > 80
      ? "var(--color-warning)"
      : "var(--color-accent)";

  return (
    <div
      className="rounded-2xl p-5 group transition-all duration-200"
      style={{
        background: "var(--color-surface)",
        border: `1px solid ${isOver ? "var(--color-expense)" : "var(--color-border)"}`,
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: category
                ? `${category.color}20`
                : "var(--color-surface-2)",
              color: category?.color ?? "var(--color-text-muted)",
            }}
          >
            <IconComp size={18} />
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {category?.name ?? "Unknown"}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Budget: {fmt(amount)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-secondary)",
            }}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--color-expense)18",
              color: "var(--color-expense)",
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "var(--color-surface-2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percent}%`, background: color }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isOver && (
            <AlertTriangle
              size={13}
              style={{ color: "var(--color-expense)" }}
            />
          )}
          <span
            className="text-xs font-medium"
            style={{
              color: isOver
                ? "var(--color-expense)"
                : "var(--color-text-muted)",
            }}
          >
            {isOver
              ? `Over by ${fmt(Math.abs(remaining))}`
              : `${fmt(remaining)} left`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold" style={{ color }}>
            {percent.toFixed(0)}%
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            · {fmt(spent)} spent
          </span>
        </div>
      </div>
    </div>
  );
}
