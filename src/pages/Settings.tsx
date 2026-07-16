import { useState, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { useAuth } from "../hooks/useAuth";
import { SettingRow } from "../components/settings/SettingRow";
import { SettingSection } from "../components/settings/SettingSection";
import { ThemeToggle } from "../components/settings/ThemeToggle";
import { CurrencySelect } from "../components/settings/CurrencySelect";
import { DangerZone } from "../components/settings/DangerZone";
import { AppStats } from "../components/settings/AppStats";
import { LogOut, Linkedin, Github, Globe, Mail, Check } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const name = useAppStore((s) => s.settings.name);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const { user, signOut } = useAuth();

  const [draftName, setDraftName] = useState(name);

  // Keep draft in sync if settings load/change from elsewhere (e.g. another tab)
  useEffect(() => {
    setDraftName(name);
  }, [name]);

  const isDirty = draftName.trim() !== name && draftName.trim() !== "";

  const handleSave = () => {
    if (!user || !isDirty) return;
    updateSettings({ name: draftName.trim() }, user.id);
    toast.success("Name updated");
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
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
            value={draftName}
            placeholder="Your name"
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
        </SettingRow>

        {isDirty && (
          <div className="flex justify-end pb-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-accent-foreground, white)",
              }}
            >
              <Check size={13} />
              Save changes
            </button>
          </div>
        )}

        {user?.email && (
          <SettingRow label="Google account" description="Signed in as">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              {user.email}
            </span>
          </SettingRow>
        )}
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

      {/* Data summary */}
      <SettingSection title="Data Summary">
        <div className="py-3">
          <AppStats />
        </div>
      </SettingSection>

      {/* Contact */}
      <SettingSection title="Contact Me">
        <div className="py-3 grid grid-cols-2 gap-2.5">
          {[
            {
              href: "https://www.linkedin.com/in/zabiahmed3717",
              label: "LinkedIn",
              icon: <Linkedin size={15} />,
            },
            {
              href: "https://github.com/zabi17/",
              label: "GitHub",
              icon: <Github size={15} />,
            },
            {
              href: "https://zabi17.github.io/portfolio",
              label: "Portfolio",
              icon: <Globe size={15} />,
            },
            {
              href: "mailto:zabiahmed3717@gmail.com",
              label: "Email",
              icon: <Mail size={15} />,
            },
          ].map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-opacity cursor-pointer hover:text-income"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              {icon}
              {label}
            </a>
          ))}
        </div>
      </SettingSection>

      {/* Danger zone */}
      <SettingSection title="Danger Zone">
        <div className="py-3">
          <DangerZone />
        </div>
      </SettingSection>

      {/* Sign out */}
      <SettingSection title="Account">
        <div className="py-3">
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-70"
            style={{
              background: "var(--color-expense)15",
              border: "1px solid var(--color-expense)40",
              color: "var(--color-expense)",
            }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </SettingSection>

      <p
        className="text-center text-xs pb-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        MoneyZombie · Your data is private and secure <br /> Follow me on{" "}
        <a
          href="https://linkedin.com/in/zabiahmed3717"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-accent"
        >
          LinkedIn: Zabi Ahmed
        </a>
      </p>
    </div>
  );
}
