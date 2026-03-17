type Props = {
  label: string;
  value: string;
  sub?: string;
  color?: string;
};

export function StatHighlight({ label, value, sub, color }: Props) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </p>
      <p
        className="text-xl font-bold"
        style={{
          fontFamily: "var(--font-display)",
          color: color ?? "var(--color-text-primary)",
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
