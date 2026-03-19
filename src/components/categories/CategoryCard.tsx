import * as Icons from "lucide-react";
import { Pencil, Trash2, Lock } from "lucide-react";
import { Category } from "../../types";

const DEFAULT_IDS = [
  "food",
  "transport",
  "shopping",
  "entertainment",
  "health",
  "utilities",
  "rent",
  "education",
  "salary",
  "freelance",
  "investment",
  "other",
];

type Props = {
  category: Category;
  txCount: number;
  onEdit: () => void;
  onDelete: () => void;
};

export function CategoryCard({ category, txCount, onEdit, onDelete }: Props) {
  const IconComp = (Icons as any)[category.icon] ?? Icons.CircleDot;
  const isDefault = DEFAULT_IDS.includes(category.id);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl group transition-all duration-150"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${category.color}20`, color: category.color }}
      >
        <IconComp size={18} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {category.name}
          </p>
          {isDefault && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-text-muted)",
              }}
            >
              default
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span className="capitalize">{category.type}</span>
          {txCount > 0 &&
            ` · ${txCount} transaction${txCount !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Type badge */}
      <span
        className="text-xs font-semibold px-2 py-1 rounded-lg capitalize shrink-0"
        style={{
          background:
            category.type === "expense"
              ? "var(--color-expense)15"
              : "var(--color-income)15",
          color:
            category.type === "expense"
              ? "var(--color-expense)"
              : "var(--color-income)",
        }}
      >
        {category.type}
      </span>

      {/* Actions */}
      <div className="flex gap-1 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 lg:transition-opacity">
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
        {isDefault ? (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-muted)",
            }}
            title="Default categories cannot be deleted"
          >
            <Lock size={13} />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
