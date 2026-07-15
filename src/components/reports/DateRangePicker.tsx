import { useState } from "react";
import { Drawer } from "vaul";
import { Calendar, Check } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  format,
} from "date-fns";

export type DateRange = {
  label: string;
  start: string | null; // "yyyy-MM-dd", null = no lower bound
  end: string | null; // "yyyy-MM-dd", null = no upper bound
};

const today = new Date();

const PRESETS: DateRange[] = [
  {
    label: "This Month",
    start: format(startOfMonth(today), "yyyy-MM-dd"),
    end: format(endOfMonth(today), "yyyy-MM-dd"),
  },
  {
    label: "Last Month",
    start: format(startOfMonth(subMonths(today, 1)), "yyyy-MM-dd"),
    end: format(endOfMonth(subMonths(today, 1)), "yyyy-MM-dd"),
  },
  {
    label: "Last 3 Months",
    start: format(startOfMonth(subMonths(today, 2)), "yyyy-MM-dd"),
    end: format(endOfMonth(today), "yyyy-MM-dd"),
  },
  {
    label: "Last 6 Months",
    start: format(startOfMonth(subMonths(today, 5)), "yyyy-MM-dd"),
    end: format(endOfMonth(today), "yyyy-MM-dd"),
  },
  {
    label: "This Year",
    start: format(startOfYear(today), "yyyy-MM-dd"),
    end: format(endOfMonth(today), "yyyy-MM-dd"),
  },
  {
    label: "All Time",
    start: null,
    end: null,
  },
];

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

export function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value.start ?? "");
  const [customEnd, setCustomEnd] = useState(value.end ?? "");

  const applyPreset = (preset: DateRange) => {
    onChange(preset);
    setOpen(false);
  };

  const applyCustom = () => {
    if (!customStart || !customEnd) return;
    onChange({
      label: `${format(new Date(customStart), "MMM d")} – ${format(
        new Date(customEnd),
        "MMM d, yyyy",
      )}`,
      start: customStart,
      end: customEnd,
    });
    setOpen(false);
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        >
          <Calendar size={15} />
          {value.label}
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl outline-none max-h-[85vh] flex flex-col"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderBottom: "none",
          }}
        >
          <div
            className="mx-auto mt-3 h-1.5 w-10 rounded-full shrink-0"
            style={{ background: "var(--color-border)" }}
          />

          <div className="px-5 pt-4 pb-2">
            <Drawer.Title
              className="text-base font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Export Range
            </Drawer.Title>
          </div>

          <div className="overflow-y-auto px-5 pb-6 flex flex-col gap-1.5">
            {PRESETS.map((preset) => {
              const isActive = value.label === preset.label;
              return (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    background: isActive
                      ? "var(--color-accent)"
                      : "var(--color-background)",
                    color: isActive
                      ? "var(--color-accent-foreground, white)"
                      : "var(--color-text-primary)",
                  }}
                >
                  {preset.label}
                  {isActive && <Check size={16} />}
                </button>
              );
            })}

            <div
              className="mt-3 pt-4"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <p
                className="text-xs font-semibold mb-2.5 uppercase tracking-wide"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Custom Range
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
                <span style={{ color: "var(--color-text-secondary)" }}>–</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
              <button
                onClick={applyCustom}
                disabled={!customStart || !customEnd}
                className="w-full mt-3 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-80"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-accent-foreground, white)",
                }}
              >
                Apply Custom Range
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
