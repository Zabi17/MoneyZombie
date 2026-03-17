const COLORS = [
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#14b8a6",
  "#22c55e",
  "#84cc16",
  "#eab308",
  "#f59e0b",
  "#6b7280",
  "#0ea5e9",
  "#d946ef",
  "#fb7185",
  "#34d399",
  "#fbbf24",
  "#a3e635",
];

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className="w-7 h-7 rounded-full transition-all duration-150 shrink-0"
            style={{
              background: color,
              outline:
                value === color
                  ? `3px solid var(--color-text-primary)`
                  : "3px solid transparent",
              outlineOffset: "2px",
              transform: value === color ? "scale(1.15)" : "scale(1)",
            }}
          />
        ))}
      </div>
      {/* Custom hex input */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full shrink-0 border"
          style={{ background: value, borderColor: "var(--color-border)" }}
        />
        <input
          type="text"
          maxLength={7}
          placeholder="#ffffff"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none font-mono"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        />
      </div>
    </div>
  );
}
