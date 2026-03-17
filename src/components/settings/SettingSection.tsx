type Props = {
  title: string;
  children: React.ReactNode;
};

export function SettingSection({ title, children }: Props) {
  return (
    <div
      className="rounded-2xl px-5 pt-4 pb-1"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-2"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-display)",
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}
