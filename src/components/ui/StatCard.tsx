type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  icon: React.ReactNode;
};

export function StatCard({ label, value, sub, accent, icon }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-display)",
          }}
        >
          {label}
        </span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: accent ? `${accent}18` : "var(--color-surface-2)",
            color: accent ?? "var(--color-text-secondary)",
          }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          className="text-2xl font-bold tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: accent ?? "var(--color-text-primary)",
          }}
        >
          {value}
        </p>
        {sub && (
          <p
            className="text-xs mt-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
