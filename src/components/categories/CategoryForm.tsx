import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useAppStore } from "../../store/useAppStore";
import { Category, TransactionType } from "../../types";
import { IconPicker } from "./IconPicker";
import { ColorPicker } from "./ColorPicker";
import * as Icons from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: Category | null;
};

const EMPTY = {
  name: "",
  icon: "CircleDot",
  color: "#6366f1",
  type: "expense" as TransactionType,
};

export function CategoryForm({ open, onClose, editing }: Props) {
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        icon: editing.icon,
        color: editing.color,
        type: editing.type,
      });
    } else {
      setForm(EMPTY);
    }
    setError("");
  }, [editing, open]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim()) return setError("Category name is required");
    if (!form.color || form.color.length < 4)
      return setError("Pick a valid color");

    if (editing) {
      updateCategory(editing.id, form);
    } else {
      addCategory(form);
    }
    onClose();
  };

  const PreviewIcon = (Icons as any)[form.icon] ?? Icons.CircleDot;

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
            {editing ? "Edit Category" : "New Category"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Preview */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
              style={{ background: `${form.color}25`, color: form.color }}
            >
              <PreviewIcon size={22} />
            </div>
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: "var(--color-text-primary)" }}
              >
                {form.name || "Category preview"}
              </p>
              <p
                className="text-xs capitalize"
                style={{ color: "var(--color-text-muted)" }}
              >
                {form.type} · {form.icon}
              </p>
            </div>
          </div>

          {/* Type toggle */}
          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Type
            </label>
            <div
              className="flex gap-2 p-1 rounded-xl"
              style={{ background: "var(--color-surface-2)" }}
            >
              {(["expense", "income"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => set("type", t)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200"
                  style={{
                    background:
                      form.type === t
                        ? t === "expense"
                          ? "var(--color-expense)"
                          : "var(--color-income)"
                        : "transparent",
                    color:
                      form.type === t ? "white" : "var(--color-text-muted)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Name
            </label>
            <input
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              placeholder="e.g. Groceries"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          {/* Icon picker */}
          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Icon
            </label>
            <IconPicker value={form.icon} onChange={(v) => set("icon", v)} />
          </div>

          {/* Color picker */}
          <div>
            <label
              className="text-xs font-medium mb-2 block"
              style={{ color: "var(--color-text-muted)" }}
            >
              Color
            </label>
            <ColorPicker value={form.color} onChange={(v) => set("color", v)} />
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
            {editing ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
