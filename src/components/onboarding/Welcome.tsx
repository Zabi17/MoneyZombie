import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { CURRENCIES } from "../../constants/defaults";

type Props = { userId: string };

export function Welcome({ userId }: Props) {
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [step, setStep] = useState<1 | 2>(1);

  const handleFinish = () => {
    updateSettings({ name: name.trim() || "Friend", currency }, userId);
  };

  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-background)" }}
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1
            className="text-3xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            One last thing
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Let's personalize your experience
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label
                className="text-xs font-medium mb-2 block"
                style={{ color: "var(--color-text-muted)" }}
              >
                What should we call you?
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
                placeholder="Your name"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setStep(2)}
              />
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-accent)",
                color: "black",
                fontFamily: "var(--font-display)",
              }}
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label
                className="text-xs font-medium mb-2 block"
                style={{ color: "var(--color-text-muted)" }}
              >
                Your preferred currency
              </label>
              <div className="space-y-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
                    style={{
                      background:
                        currency === c.code
                          ? `var(--color-accent)15`
                          : "var(--color-surface-2)",
                      border: `1px solid ${currency === c.code ? "var(--color-accent)" : "var(--color-border)"}`,
                      color:
                        currency === c.code
                          ? "var(--color-accent)"
                          : "var(--color-text-secondary)",
                    }}
                  >
                    <span className="text-lg font-bold w-6">{c.symbol}</span>
                    <span className="font-semibold">{c.code}</span>
                    <span style={{ color: "var(--color-text-muted)" }}>
                      — {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-accent)",
                color: "black",
                fontFamily: "var(--font-display)",
              }}
            >
              Get started <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
