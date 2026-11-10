import { useState, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Lend, LendDirection } from "../../types";
import { useCurrency } from "../../hooks/useCurrency";
import { format } from "date-fns";
import { useAuth } from "../../hooks/useAuth";
import * as Icons from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const EMPTY = {
  direction: "lent" as LendDirection,
  title: "",
  amount: "",
  categoryId: "",
  date: format(new Date(), "yyyy-MM-dd"),
  note: "",
};

const DIRECTIONS: { value: LendDirection; label: string; hint: string }[] = [
  { value: "lent", label: "I lent", hint: "Money I gave" },
  { value: "borrowed", label: "I borrowed", hint: "Money I owe" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: Lend | null;
};

export function LendForm({ open, onClose, editing }: Props) {
  const categories = useAppStore((s) => s.categories);
  const addLend = useAppStore((s) => s.addLend);
  const updateLend = useAppStore((s) => s.updateLend);
  const { symbol } = useCurrency();
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          direction: editing.direction ?? "lent",
          title: editing.title,
          amount: String(editing.amount),
          categoryId: editing.categoryId,
          date: editing.lentOn,
          note: editing.note ?? "",
        });
      } else {
        setForm({ ...EMPTY, date: format(new Date(), "yyyy-MM-dd") });
      }
      setError("");
    }
  }, [open, editing]);

  const isBorrowed = form.direction === "borrowed";

  // Lent = money went out (expense). Borrowed = money came in (income).
  const categoryOptions = categories.filter(
    (c) => c.type === (isBorrowed ? "income" : "expense"),
  );

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const setDirection = (d: LendDirection) => {
    if (editing || d === form.direction) return;
    // category lists differ per direction, so reset the selection
    setForm((f) => ({ ...f, direction: d, categoryId: "" }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("Name is required");
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return setError("Enter a valid amount");
    if (!form.categoryId) return setError("Select a category");
    if (!form.date) return setError("Pick a date");

    if (editing) {
      const ok = await updateLend(editing.id, {
        title: form.title.trim(),
        amount: Number(form.amount),
        categoryId: form.categoryId,
        note: form.note.trim() || undefined,
        lentOn: form.date,
      });
      if (!ok) return; // keep sheet open, toast already shown by store
    } else {
      addLend(
        {
          direction: form.direction,
          title: form.title.trim(),
          amount: Number(form.amount),
          categoryId: form.categoryId,
          note: form.note.trim() || undefined,
          lentOn: form.date,
        },
        user!.id,
      );
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
            {editing
              ? isBorrowed
                ? "Edit Borrowing"
                : "Edit Lend"
              : isBorrowed
                ? "New Borrowing"
                : "New Lend"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-3">
          {/* Direction tabs */}
          <div
            className="grid grid-cols-2 gap-1 p-1 rounded-xl"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              opacity: editing ? 0.6 : 1,
            }}
          >
            {DIRECTIONS.map((d) => {
              const active = form.direction === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  disabled={!!editing}
                  onClick={() => setDirection(d.value)}
                  className="flex flex-col items-center py-2 rounded-lg transition-all duration-150 disabled:cursor-not-allowed"
                  style={{
                    background: active ? "var(--color-accent)" : "transparent",
                    color: active ? "black" : "var(--color-text-secondary)",
                  }}
                >
                  <span className="text-sm font-bold">{d.label}</span>
                  <span className="text-[10px] font-medium opacity-70">
                    {d.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              {isBorrowed ? "Who did you borrow from?" : "Who did you lend to?"}
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              placeholder="Name"
              maxLength={80}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

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
                inputMode="decimal"
                min="0"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((cat) => {
                const IconComp = (Icons as any)[cat.icon] ?? Icons.CircleDot;
                const selected = form.categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
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

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              {isBorrowed ? "Date borrowed" : "Date lent"}
            </label>
            <input
              type="date"
              className={inputClass}
              style={{ ...inputStyle, colorScheme: "dark" }}
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>

          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Note <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              className={inputClass}
              style={{ ...inputStyle, resize: "none" }}
              rows={2}
              maxLength={300}
              placeholder="Any extra details..."
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
            />
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
            className="w-full py-3 rounded-xl text-sm font-bold mt-2 transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-accent)",
              color: "black",
              fontFamily: "var(--font-display)",
            }}
          >
            {editing
              ? "Save Changes"
              : isBorrowed
                ? "Add Borrowing"
                : "Add Lend"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
