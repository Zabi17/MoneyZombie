import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useAppStore } from "../../store/useAppStore";
import { useCurrency } from "../../hooks/useCurrency";
import * as Icons from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  month: string;
  editing?: { id: string; categoryId: string; amount: number } | null;
};

export function BudgetForm({ open, onClose, month, editing }: Props) {
  const categories = useAppStore((s) => s.categories);
  const budgets = useAppStore((s) => s.budgets);
  const setBudget = useAppStore((s) => s.setBudget);
  const { symbol } = useCurrency();

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  // Categories that are expense type and don't already have a budget this month
  // (unless we're editing that one)
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const available = expenseCategories.filter((c) => {
    const hasBudget = budgets.some(
      (b) => b.categoryId === c.id && b.month === month,
    );
    if (editing && editing.categoryId === c.id) return true;
    return !hasBudget;
  });

  useEffect(() => {
    if (editing) {
      setCategoryId(editing.categoryId);
      setAmount(String(editing.amount));
    } else {
      setCategoryId("");
      setAmount("");
    }
    setError("");
  }, [editing, open]);

  const handleSubmit = () => {
    if (!categoryId) return setError("Select a category");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return setError("Enter a valid budget amount");

    setBudget({ categoryId, amount: Number(amount), month });
    onClose();
  };

  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-4 pb-8 pt-6 lg:max-w-md lg:mx-auto"
        style={{
          background: "var(--color-surface)",
          border: "none",
          maxHeight: "90svh",
          overflowY: "auto",
        }}
      >
        <SheetHeader className="mb-5">
          <SheetTitle
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            {editing ? "Edit Budget" : "Set Budget"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Category picker */}
          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Category
            </label>

            {available.length === 0 && !editing ? (
              <p
                className="text-sm py-3 text-center rounded-xl"
                style={{
                  background: "var(--color-surface-2)",
                  color: "var(--color-text-muted)",
                }}
              >
                All categories have budgets for this month 🎉
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {(editing ? expenseCategories : available).map((cat) => {
                  const IconComp = (Icons as any)[cat.icon] ?? Icons.CircleDot;
                  const selected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium transition-all duration-150"
                      style={{
                        background: selected
                          ? `${cat.color}25`
                          : "var(--color-surface-2)",
                        border: `1px solid ${selected ? cat.color : "var(--color-border)"}`,
                        color: selected
                          ? cat.color
                          : "var(--color-text-secondary)",
                      }}
                    >
                      <IconComp size={16} />
                      <span className="text-center leading-tight">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Monthly limit
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
                style={{ color: "var(--color-text-muted)" }}
              >
                {symbol}
              </span>
              <input
                type="number"
                min="0"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p
              className="text-xs font-medium px-3 py-2 rounded-lg"
              style={{
                background: "var(--color-expense)18",
                color: "var(--color-expense)",
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-accent)",
              color: "black",
              fontFamily: "var(--font-display)",
            }}
          >
            {editing ? "Save Changes" : "Set Budget"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
