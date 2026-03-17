import { useState, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Category, TransactionType } from "../types";
import { CategoryCard } from "../components/categories/CategoryCard";
import { CategoryForm } from "../components/categories/CategoryForm";
import { DeleteDialog } from "../components/transactions/DeleteDialog";

export default function Categories() {
  const categories = useAppStore((s) => s.categories);
  const transactions = useAppStore((s) => s.transactions);
  const deleteCategory = useAppStore((s) => s.deleteCategory);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");

  const filtered = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || c.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [categories, search, typeFilter]);

  const expenseCategories = filtered.filter((c) => c.type === "expense");
  const incomeCategories = filtered.filter((c) => c.type === "income");

  const txCount = (id: string) =>
    transactions.filter((t) => t.categoryId === id).length;

  const openEdit = (c: Category) => {
    setEditing(c);
    setFormOpen(true);
  };
  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const inputStyle = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
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
            {categories.length} total
          </p>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Categories
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
          <Plus size={16} /> New
        </button>
      </div>

      {/* Search + filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-muted)" }}
          />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={inputStyle}
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-muted)" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {(["all", "expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150"
              style={{
                background:
                  typeFilter === t
                    ? "var(--color-accent)"
                    : "var(--color-surface)",
                color:
                  typeFilter === t ? "black" : "var(--color-text-secondary)",
                border: `1px solid ${typeFilter === t ? "var(--color-accent)" : "var(--color-border)"}`,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Expense group */}
      {expenseCategories.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-xs font-semibold uppercase tracking-widest px-1"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            Expense · {expenseCategories.length}
          </p>
          {expenseCategories.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              txCount={txCount(c.id)}
              onEdit={() => openEdit(c)}
              onDelete={() => setDeleting(c)}
            />
          ))}
        </div>
      )}

      {/* Income group */}
      {incomeCategories.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-xs font-semibold uppercase tracking-widest px-1"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            Income · {incomeCategories.length}
          </p>
          {incomeCategories.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              txCount={txCount(c.id)}
              onEdit={() => openEdit(c)}
              onDelete={() => setDeleting(c)}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
          style={{ border: "1px dashed var(--color-border)" }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            {search ? "No categories match your search" : "No categories yet"}
          </p>
          {!search && (
            <button
              onClick={openAdd}
              className="text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--color-accent)" }}
            >
              Create your first category →
            </button>
          )}
        </div>
      )}

      {/* Form */}
      <CategoryForm
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
        title={deleting?.name}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteCategory(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
