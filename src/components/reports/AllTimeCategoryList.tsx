import * as Icons from "lucide-react";
import { useCurrency } from "../../hooks/useCurrency";

type CategoryTotal = {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
};

type Props = { data: CategoryTotal[]; grandTotal: number };

export function AllTimeCategoryList({ data, grandTotal }: Props) {
  const { format: fmt } = useCurrency();

  if (data.length === 0) {
    return (
      <p
        className="text-sm py-4 text-center"
        style={{ color: "var(--color-text-muted)" }}
      >
        No expense data yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((cat, i) => {
        const IconComp = (Icons as any)[cat.icon] ?? Icons.CircleDot;
        const pct = grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0;
        return (
          <div key={cat.id}>
            <div className="flex items-center gap-3 mb-1.5">
              <span
                className="text-xs font-bold w-5 text-right shrink-0"
                style={{ color: "var(--color-text-muted)" }}
              >
                {i + 1}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${cat.color}20`, color: cat.color }}
              >
                <IconComp size={14} />
              </div>
              <span
                className="text-sm font-medium flex-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                {cat.name}
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {fmt(cat.total)}
              </span>
              <span
                className="text-xs w-9 text-right shrink-0"
                style={{ color: "var(--color-text-muted)" }}
              >
                {pct.toFixed(0)}%
              </span>
            </div>
            <div
              className="ml-12 h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--color-surface-2)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: cat.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
