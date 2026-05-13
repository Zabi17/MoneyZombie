import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useAppStore } from "../../store/useAppStore";
import { useAuth } from "../../hooks/useAuth";
import { SavingsPotType } from "../../types";
import * as Icons from "lucide-react";
import { ChevronDown } from "lucide-react";

const ICONS = [
  "PiggyBank",
  "Target",
  "Shield",
  "Star",
  "Home",
  "Car",
  "Plane",
  "Smartphone",
  "GraduationCap",
  "Heart",
];
const COLORS = [
  "#4ade80",
  "#60a5fa",
  "#f97316",
  "#e879f9",
  "#facc15",
  "#34d399",
  "#fb7185",
  "#a78bfa",
  "#38bdf8",
  "#f472b6",
];
const TYPES: { value: SavingsPotType; label: string; desc: string }[] = [
  { value: "goal", label: "Goal", desc: "Save toward a target amount" },
  {
    value: "recurring",
    label: "Recurring",
    desc: "Set aside money every month",
  },
  {
    value: "emergency",
    label: "Emergency",
    desc: "Safety net with withdrawal warning",
  },
];

type Props = { open: boolean; onClose: () => void };

export function AddPotSheet({ open, onClose }: Props) {
  const addPot = useAppStore((s) => s.addPot);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [type, setType] = useState<SavingsPotType>("goal");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [recurringAmount, setRecurringAmount] = useState("");
  const [floorAmount, setFloorAmount] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setType("goal");
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setTargetAmount("");
    setDeadline("");
    setRecurringAmount("");
    setFloorAmount("");
    setIsLocked(false);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) return setError("Give your pot a name");
    if (!user) return;

    await addPot(
      {
        name: name.trim(),
        icon,
        color,
        type,
        targetAmount: targetAmount ? Number(targetAmount) : undefined,
        deadline: deadline || undefined,
        recurringAmount: recurringAmount ? Number(recurringAmount) : undefined,
        floorAmount: floorAmount ? Number(floorAmount) : undefined,
        isLocked,
      },
      user.id,
    );

    handleClose();
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none";
  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-4 pb-8 pt-6"
        style={{
          background: "var(--color-surface)",
          border: "none",
          maxHeight: "92svh",
          overflowY: "auto",
        }}
      >
        {/* Responsive container for large screens */}
        <div className="max-w-4xl mx-auto">
          <SheetHeader className="mb-5">
            <SheetTitle
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
                fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              }}
            >
              New Savings Pot
            </SheetTitle>
          </SheetHeader>

          {/* Two-column layout for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Type selector */}
              <div>
                <label
                  className="text-xs font-medium mb-2 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Type
                </label>
                <div className="space-y-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all"
                      style={{
                        background:
                          type === t.value
                            ? "var(--color-accent)15"
                            : "var(--color-surface-2)",
                        border: `1px solid ${type === t.value ? "var(--color-accent)" : "var(--color-border)"}`,
                        color:
                          type === t.value
                            ? "var(--color-accent)"
                            : "var(--color-text-secondary)",
                      }}
                    >
                      <p className="font-semibold text-sm">{t.label}</p>
                      <p className="text-xs mt-0.5 opacity-70">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label
                  className="text-xs font-medium mb-1.5 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Name
                </label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="e.g. Emergency Fund"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                />
              </div>

              {/* Icon picker */}
              <div>
                <label
                  className="text-xs font-medium mb-2 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => {
                    const Ic = (Icons as any)[ic];
                    return (
                      <button
                        key={ic}
                        onClick={() => setIcon(ic)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{
                          background:
                            icon === ic
                              ? `${color}25`
                              : "var(--color-surface-2)",
                          border: `1px solid ${icon === ic ? color : "var(--color-border)"}`,
                        }}
                      >
                        {Ic && (
                          <Ic
                            size={16}
                            style={{
                              color:
                                icon === ic ? color : "var(--color-text-muted)",
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label
                  className="text-xs font-medium mb-2 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                      style={{
                        background: c,
                        outline: color === c ? `2px solid ${c}` : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Goal fields */}
              {type === "goal" && (
                <>
                  <div>
                    <label
                      className="text-xs font-medium mb-1.5 block"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Target Amount{" "}
                      <span style={{ fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      type="number"
                      min="0"
                      placeholder="e.g. 50000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      className="text-xs font-medium mb-1.5 block"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Deadline{" "}
                      <span style={{ fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input
                      type="date"
                      className={inputClass}
                      style={{ ...inputStyle, colorScheme: "dark" }}
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Recurring fields */}
              {type === "recurring" && (
                <div>
                  <label
                    className="text-xs font-medium mb-1.5 block"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Monthly Amount{" "}
                    <span style={{ fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={recurringAmount}
                    onChange={(e) => setRecurringAmount(e.target.value)}
                  />
                </div>
              )}

              {/* Emergency fields */}
              {type === "emergency" && (
                <>
                  <div>
                    <label
                      className="text-xs font-medium mb-1.5 block"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Minimum Floor{" "}
                      <span style={{ fontWeight: 400 }}>
                        (warn if balance drops below)
                      </span>
                    </label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      type="number"
                      min="0"
                      placeholder="e.g. 10000"
                      value={floorAmount}
                      onChange={(e) => setFloorAmount(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setIsLocked(!isLocked)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all"
                    style={{
                      background: isLocked
                        ? "var(--color-warning)15"
                        : "var(--color-surface-2)",
                      border: `1px solid ${isLocked ? "var(--color-warning)50" : "var(--color-border)"}`,
                      color: isLocked
                        ? "var(--color-warning)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    <span className="font-semibold">Lock this pot</span>
                    <span className="text-xs opacity-70">
                      {isLocked ? "On — always warn on withdraw" : "Off"}
                    </span>
                  </button>
                </>
              )}

              {error && (
                <p
                  className="text-xs font-medium px-3 py-2 rounded-lg"
                  style={{
                    background: "var(--color-expense)18",
                    color: "var(--color-expense)",
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Submit button - full width on all screens */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-accent)",
                color: "black",
                fontFamily: "var(--font-display)",
              }}
            >
              Create Pot
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
