import * as Icons from "lucide-react";

const ICON_OPTIONS = [
  "UtensilsCrossed",
  "Wrench",
  "User",
  "UserStar",
  "ShieldQuestionMark",
  "Car",
  "BadgeDollarSign", 
  "ShoppingBag",
  "Tv",
  "HeartPulse",
  "Zap",
  "Home",
  "GraduationCap",
  "Wallet",
  "Laptop",
  "TrendingUp",
  "CircleDot",
  "Plane",
  "Coffee",
  "Music",
  "Gift",
  "Dumbbell",
  "BookOpen",
  "Phone",
  "Shirt",
  "Baby",
  "PawPrint",
  "Gamepad2",
  "Bus",
  "Bike",
  "Train",
  "Fuel",
  "Pill",
  "Stethoscope",
  "Scissors",
  "Camera",
  "Globe",
  "Landmark",
  "CreditCard",
  "Banknote",
  "PiggyBank",
];

type Props = {
  value: string;
  onChange: (icon: string) => void;
};

export function IconPicker({ value, onChange }: Props) {
  return (
    <div
      className="grid grid-cols-8 gap-1.5 p-3 rounded-xl overflow-y-auto max-h-44"
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
      }}
    >
      {ICON_OPTIONS.map((name) => {
        const IconComp = (Icons as any)[name] ?? Icons.CircleDot;
        const selected = value === name;
        return (
          <button
            key={name}
            onClick={() => onChange(name)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{
              background: selected ? "var(--color-accent)" : "transparent",
              color: selected ? "black" : "var(--color-text-secondary)",
            }}
          >
            <IconComp size={15} />
          </button>
        );
      })}
    </div>
  );
}
