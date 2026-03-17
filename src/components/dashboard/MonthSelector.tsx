import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

type Props = {
  date: Date;
  onChange: (d: Date) => void;
};

export function MonthSelector({ date, onChange }: Props) {
  const isCurrentMonth =
    format(date, "yyyy-MM") === format(new Date(), "yyyy-MM");

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(subMonths(date, 1))}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
        style={{
          background: "var(--color-surface-2)",
          color: "var(--color-text-secondary)",
        }}
      >
        <ChevronLeft size={16} />
      </button>
      <span
        className="text-sm font-semibold min-w-28 text-center"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
        }}
      >
        {format(date, "MMMM yyyy")}
      </span>
      <button
        onClick={() => onChange(addMonths(date, 1))}
        disabled={isCurrentMonth}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70 disabled:opacity-30"
        style={{
          background: "var(--color-surface-2)",
          color: "var(--color-text-secondary)",
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
