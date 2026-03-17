type Props = {
  label: string;
  description?: string;
  children: React.ReactNode;
};

export function SettingRow({ label, description, children }: Props) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-4"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          {label}
        </p>
        {description && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
