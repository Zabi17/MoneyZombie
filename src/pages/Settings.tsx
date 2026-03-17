import { useAppStore } from "../store/useAppStore";
import { SettingRow } from "../components/settings/SettingRow";
import { SettingSection } from "../components/settings/SettingSection";
import { ThemeToggle } from "../components/settings/ThemeToggle";
import { CurrencySelect } from "../components/settings/CurrencySelect";
import { DangerZone } from "../components/settings/DangerZone";
import { AppStats } from "../components/settings/AppStats";

export default function Settings() {
  const name = useAppStore((s) => s.settings.name);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* Header */}
      <div>
        <p
          className="text-xs font-medium uppercase tracking-widest mb-0.5"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-display)",
          }}
        >
          Preferences
        </p>
        <h1
          className="text-2xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          Settings
        </h1>
      </div>

      {/* Profile */}
      <SettingSection title="Profile">
        <SettingRow
          label="Your name"
          description="Used in the dashboard greeting"
        >
          <input
            className="px-3 py-2 rounded-xl text-sm outline-none text-right"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              width: "140px",
            }}
            value={name}
            placeholder="Your name"
            onChange={(e) => updateSettings({ name: e.target.value })}
          />
        </SettingRow>
      </SettingSection>

      {/* Appearance */}
      <SettingSection title="Appearance">
        <SettingRow
          label="Theme"
          description="Choose light, dark, or follow system"
        >
          <ThemeToggle />
        </SettingRow>
      </SettingSection>

      {/* Locale */}
      <SettingSection title="Locale">
        <SettingRow label="Currency" description="Used across all amounts">
          <CurrencySelect />
        </SettingRow>
      </SettingSection>

      {/* App stats */}
      <SettingSection title="Data Summary">
        <div className="py-3">
          <AppStats />
        </div>
      </SettingSection>

      {/* Danger zone */}
      <SettingSection title="Danger Zone">
        <div className="py-3">
          <DangerZone />
        </div>
      </SettingSection>

      {/* Footer */}
      <p
        className="text-center text-xs pb-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        MoneyZombie · All data stored locally on your device
      </p>
    </div>
  );
}
