import { Search, X } from "lucide-react";
import { TransactionType } from "../../types";

type Props = {
  search: string;
  onSearch: (v: string) => void;
  typeFilter: TransactionType | "all";
  onTypeFilter: (v: TransactionType | "all") => void;
  categoryFilter: string;
  onCategoryFilter: (v: string) => void;
  categories: { id: string; name: string; type: TransactionType }[];
};

export function FilterBar({
  search,
  onSearch,
  typeFilter,
  onTypeFilter,
  categoryFilter,
  onCategoryFilter,
  categories,
}: Props) {
  const inputStyle = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
  };

  const filtered =
    typeFilter === "all"
      ? categories
      : categories.filter((c) => c.type === typeFilter);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--color-text-muted)" }}
        />
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={inputStyle}
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Type + Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["all", "expense", "income"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              onTypeFilter(t);
              onCategoryFilter("");
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize shrink-0 transition-all duration-150"
            style={{
              background:
                typeFilter === t
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
              color: typeFilter === t ? "black" : "var(--color-text-secondary)",
              border: `1px solid ${typeFilter === t ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          >
            {t}
          </button>
        ))}

        <div
          className="w-px shrink-0"
          style={{ background: "var(--color-border)" }}
        />

        {filtered.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              onCategoryFilter(categoryFilter === cat.id ? "" : cat.id)
            }
            className="px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all duration-150"
            style={{
              background:
                categoryFilter === cat.id
                  ? "var(--color-surface-2)"
                  : "var(--color-surface)",
              color:
                categoryFilter === cat.id
                  ? "var(--color-text-primary)"
                  : "var(--color-text-muted)",
              border: `1px solid ${categoryFilter === cat.id ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
