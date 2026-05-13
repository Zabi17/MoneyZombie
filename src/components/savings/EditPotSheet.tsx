import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useAppStore } from "../../store/useAppStore";
import { SavingsPot, SavingsPotType } from "../../types";
import * as Icons from "lucide-react";

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

type Props = {
  pot: SavingsPot | null;
  onClose: () => void;
};

export function EditPotSheet({ pot, onClose }: Props) {
  const updatePot = useAppStore((s) => s.updatePot);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [recurringAmount, setRecurringAmount] = useState("");
  const [floorAmount, setFloorAmount] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState("");

  // Sync fields when pot changes
  useEffect(() => {
    if (!pot) return;
    setName(pot.name);
    setIcon(pot.icon);
    setColor(pot.color);
    setTargetAmount(pot.targetAmount ? String(pot.targetAmount) : "");
    setDeadline(pot.deadline ?? "");
    setRecurringAmount(pot.recurringAmount ? String(pot.recurringAmount) : "");
    setFloorAmount(pot.floorAmount ? String(pot.floorAmount) : "");
    setIsLocked(pot.isLocked ?? false);
    setError("");
  }, [pot]);

  const handleSave = async () => {
    if (!pot) return;
    if (!name.trim()) return setError("Name is required");

    await updatePot(pot.id, {
      name: name.trim(),
      icon,
      color,
      targetAmount: targetAmount ? Number(targetAmount) : undefined,
      deadline: deadline || undefined,
      recurringAmount: recurringAmount ? Number(recurringAmount) : undefined,
      floorAmount: floorAmount ? Number(floorAmount) : undefined,
      isLocked,
    });

    onClose();
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none";
  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
  };

  if (!pot) return null;

  return (
    <Sheet open={!!pot} onOpenChange={(v) => !v && onClose()}>
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
        <SheetHeader className="mb-5">
          <SheetTitle
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Edit {pot.name}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
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
                        icon === ic ? `${color}25` : "var(--color-surface-2)",
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

          {/* Goal fields */}
          {pot.type === "goal" && (
            <>
              <div>
                <label
                  className="text-xs font-medium mb-1.5 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Target Amount
                </label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="text-xs font-medium mb-1.5 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Deadline
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
          {pot.type === "recurring" && (
            <div>
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: "var(--color-text-muted)" }}
              >
                Monthly Amount
              </label>
              <input
                className={inputClass}
                style={inputStyle}
                type="number"
                min="0"
                value={recurringAmount}
                onChange={(e) => setRecurringAmount(e.target.value)}
              />
            </div>
          )}

          {/* Emergency fields */}
          {pot.type === "emergency" && (
            <>
              <div>
                <label
                  className="text-xs font-medium mb-1.5 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Minimum Floor
                </label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  min="0"
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
                  {isLocked ? "On" : "Off"}
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

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-accent)",
              color: "black",
              fontFamily: "var(--font-display)",
            }}
          >
            Save Changes
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
