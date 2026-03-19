import { useState, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Transaction, TransactionType } from "../../types";
import { useCurrency } from "../../hooks/useCurrency";
import { format } from "date-fns";
import { nanoid } from "nanoid";
import * as Icons from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";

const EMPTY = {
  title: "",
  amount: "",
  type: "expense" as TransactionType,
  categoryId: "",
  date: format(new Date(), "yyyy-MM-dd"),
  note: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: Transaction | null;
  initialType?: TransactionType; // add this
};

export function TransactionForm({
  open,
  onClose,
  editing,
  initialType,
}: Props) {
  const categories = useAppStore((s) => s.categories);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const { symbol } = useCurrency();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        amount: String(editing.amount),
        type: editing.type,
        categoryId: editing.categoryId,
        date: editing.date,
        note: editing.note ?? "",
      });
    } else {
      setForm({ ...EMPTY, type: initialType ?? "expense" }); // use initialType here
    }
    setError("");
  }, [editing, open, initialType]);

  const filtered = categories.filter((c) => c.type === form.type);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.title.trim()) return setError("Title is required");
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return setError("Enter a valid amount");
    if (!form.categoryId) return setError("Select a category");
    if (!form.date) return setError("Pick a date");

    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      type: form.type,
      categoryId: form.categoryId,
      date: form.date,
      note: form.note.trim() || undefined,
    };

    if (editing) {
      updateTransaction(editing.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors";
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
          maxHeight: "92svh",
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
            {editing ? "Edit Transaction" : "New Transaction"}
          </SheetTitle>
        </SheetHeader>

        {/* Type toggle */}
        <div
          className="flex gap-2 p-1 rounded-xl mb-5"
          style={{ background: "var(--color-surface-2)" }}
        >
          {(["expense", "income"] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                set("type", t);
                set("categoryId", "");
              }}
              className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200"
              style={{
                background:
                  form.type === t
                    ? t === "expense"
                      ? "var(--color-expense)"
                      : "var(--color-income)"
                    : "transparent",
                color: form.type === t ? "white" : "var(--color-text-muted)",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {/* Title */}
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Title
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              placeholder="e.g. Groceries"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          {/* Amount */}
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Amount
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
                style={{ color: "var(--color-text-muted)" }}
              >
                {symbol}
              </span>
              <input
                className={inputClass}
                style={{ ...inputStyle, paddingLeft: "2rem" }}
                placeholder="0"
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {filtered.map((cat) => {
                const IconComp = (Icons as any)[cat.icon] ?? Icons.CircleDot;
                const selected = form.categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => set("categoryId", cat.id)}
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
          </div>

          {/* Date */}
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Date
            </label>
            <input
              type="date"
              className={inputClass}
              style={{ ...inputStyle, colorScheme: "dark" }}
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>

          {/* Note */}
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Note{" "}
              <span
                style={{ color: "var(--color-text-muted)", fontWeight: 400 }}
              >
                (optional)
              </span>
            </label>
            <textarea
              className={inputClass}
              style={{ ...inputStyle, resize: "none" }}
              rows={2}
              placeholder="Any extra details..."
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
            />
          </div>

          {/* Error */}
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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl text-sm font-bold mt-2 transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-accent)",
              color: "black",
              fontFamily: "var(--font-display)",
            }}
          >
            {editing ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
