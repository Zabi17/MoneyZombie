import { CURRENCIES } from "../../constants/defaults";
import { useAppStore } from "../../store/useAppStore";

export function CurrencySelect() {
  const currency = useAppStore((s) => s.settings.currency);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <select
      value={currency}
      onChange={(e) => updateSettings({ currency: e.target.value })}
      className="px-3 py-2 rounded-xl text-sm font-medium outline-none cursor-pointer"
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-primary)",
      }}
    >
      {CURRENCIES.map((c) => (
        <option
          key={c.code}
          value={c.code}
          style={{ background: "var(--color-surface)" }}
        >
          {c.symbol} {c.code} — {c.label}
        </option>
      ))}
    </select>
  );
}
