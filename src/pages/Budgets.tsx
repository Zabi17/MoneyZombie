import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useBudgets } from "../hooks/useBudgets";
import { BudgetCard } from "../components/budgets/BudgetCard";
import { BudgetForm } from "../components/budgets/BudgetForm";
import { BudgetSummaryBar } from "../components/budgets/BudgetSummaryBar";
import { DeleteDialog } from "../components/transactions/DeleteDialog";
import { MonthSelector } from "../components/dashboard/MonthSelector";

export default function Budgets() {
  const deleteBudget = useAppStore((s) => s.deleteBudget);
  const categories = useAppStore((s) => s.categories);

  const [activeDate, setActiveDate] = useState(new Date());
  const month = format(activeDate, "yyyy-MM");

  const budgets = useBudgets(month);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<{
    id: string;
    categoryId: string;
    amount: number;
  } | null>(null);
  const [deleting, setDeleting] = useState<{
    id: string;
    categoryId: string;
  } | null>(null);

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overCount = budgets.filter((b) => b.isOver).length;

  const openEdit = (b: (typeof budgets)[0]) => {
    setEditing({ id: b.id, categoryId: b.categoryId, amount: b.amount });
    setFormOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
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
            {budgets.length} budgets set
          </p>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Budgets
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
          <Plus size={16} /> Set Budget
        </button>
      </div>

      {/* Month selector */}
      <MonthSelector date={activeDate} onChange={setActiveDate} />

      {/* Overspend alert */}
      {overCount > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: "var(--color-expense)15",
            border: "1px solid var(--color-expense)40",
          }}
        >
          <span className="text-lg">⚠️</span>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-expense)" }}
          >
            You've exceeded {overCount} budget{overCount > 1 ? "s" : ""} this
            month.
          </p>
        </div>
      )}

      {/* Summary */}
      {budgets.length > 0 && (
        <BudgetSummaryBar totalBudget={totalBudget} totalSpent={totalSpent} />
      )}

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
          style={{ border: "1px dashed var(--color-border)" }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            No budgets set for {format(activeDate, "MMMM yyyy")}
          </p>
          <button
            onClick={openAdd}
            className="text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--color-accent)" }}
          >
            Set your first budget →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              {...b}
              onEdit={() => openEdit(b)}
              onDelete={() =>
                setDeleting({ id: b.id, categoryId: b.categoryId })
              }
            />
          ))}
        </div>
      )}

      {/* Form */}
      <BudgetForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        month={month}
        editing={editing}
      />

      {/* Delete */}
      <DeleteDialog
        open={!!deleting}
        title={categories.find((c) => c.id === deleting?.categoryId)?.name}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteBudget(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
