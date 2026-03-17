import { useAppStore } from "../../store/useAppStore";
import { useCurrency } from "../../hooks/useCurrency";

export function AppStats() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const budgets = useAppStore((s) => s.budgets);
  const { format: fmt } = useCurrency();

  const totalSpent = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const storageKey = "MoneyZombie-store";
  const rawData = localStorage.getItem(storageKey) ?? "";
  const sizeKB = (new Blob([rawData]).size / 1024).toFixed(1);

  const stats = [
    { label: "Transactions", value: transactions.length },
    { label: "Categories", value: categories.length },
    { label: "Budgets set", value: budgets.length },
    { label: "Total spent", value: fmt(totalSpent) },
    { label: "Storage used", value: `${sizeKB} KB` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-xl px-4 py-3"
          style={{ background: "var(--color-surface-2)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {label}
          </p>
          <p
            className="text-base font-bold mt-0.5"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
