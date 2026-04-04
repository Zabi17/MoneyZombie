import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export type ViewScope = "month" | "month+prev" | "all";

const OPTIONS: { label: string; shortLabel: string; value: ViewScope }[] = [
  { label: "This month only", shortLabel: "This month", value: "month" },
  {
    label: "This + prev month",
    shortLabel: "+ Prev month",
    value: "month+prev",
  },
  { label: "Entire history", shortLabel: "All time", value: "all" },
];

type Props = {
  value: ViewScope;
  onChange: (v: ViewScope) => void;
};

export function ScopeSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = OPTIONS.find((o) => o.value === value)!;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger chip */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
        style={{
          background:
            value !== "month"
              ? "var(--color-accent)18"
              : "var(--color-surface-2)",
          border: `1px solid ${value !== "month" ? "var(--color-accent)40" : "var(--color-border)"}`,
          color:
            value !== "month"
              ? "var(--color-accent)"
              : "var(--color-text-secondary)",
        }}
      >
        {active.shortLabel}
        <ChevronDown
          size={12}
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-50 min-w-44"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 8px 32px #0008",
          }}
        >
          {OPTIONS.map((opt) => {
            const isActive = value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm transition-all duration-100"
                style={{
                  background: isActive
                    ? "var(--color-accent)12"
                    : "transparent",
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-text-primary)",
                }}
              >
                <span className="font-medium">{opt.label}</span>
                {isActive && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
