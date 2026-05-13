import * as Icons from "lucide-react";
import { SavingsPot } from "../../types";
import { useCurrency } from "../../hooks/useCurrency";
import { useAppStore } from "../../store/useAppStore";
import { format } from "date-fns";

type Props = {
  pot: SavingsPot;
  onClick: () => void;
  onEdit: () => void;
};

const TYPE_LABEL: Record<string, string> = {
  goal: "Goal",
  recurring: "Recurring",
  emergency: "Emergency",
};

function needsRecurringReminder(
  pot: SavingsPot,
  savingsTransactions: ReturnType<
    typeof useAppStore.getState
  >["savingsTransactions"],
): boolean {
  if (pot.type !== "recurring") return false;
  const currentMonth = format(new Date(), "yyyy-MM");
  return !savingsTransactions.some(
    (t) =>
      t.toPotId === pot.id &&
      t.type === "deposit" &&
      t.createdAt.startsWith(currentMonth),
  );
}

export function PotCard({ pot, onClick, onEdit }: Props) {
  const { format: fmt } = useCurrency();
  const savingsTransactions = useAppStore((s) => s.savingsTransactions);
  const IconComp = (Icons as any)[pot.icon] ?? Icons.PiggyBank;

  const progress =
    pot.targetAmount && pot.targetAmount > 0
      ? Math.min((pot.currentAmount / pot.targetAmount) * 100, 100)
      : null;

  const showReminder = needsRecurringReminder(pot, savingsTransactions);

  return (
    <div
      className="rounded-2xl p-4 transition-all cursor-pointer"
      style={{
        background: "var(--color-surface)",
        border: showReminder
          ? "1px solid var(--color-warning)"
          : "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-3 cursor-pointer">
        {/* Icon */}
        <button onClick={onClick} className="shrink-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${pot.color}20` }}
          >
            <IconComp size={20} style={{ color: pot.color }} />
          </div>
        </button>

        {/* Info */}
        <button onClick={onClick} className="flex-1 min-w-0 text-left cursor-pointer">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {pot.name}
            </p>
            {pot.isLocked && (
              <Icons.Lock
                size={11}
                style={{ color: "var(--color-warning)", flexShrink: 0 }}
              />
            )}
            {pot.isCompleted && (
              <Icons.CheckCircle
                size={11}
                style={{ color: "var(--color-income)", flexShrink: 0 }}
              />
            )}
            {showReminder && (
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: "var(--color-warning)20",
                  color: "var(--color-warning)",
                  fontSize: "10px",
                }}
              >
                Not deposited this month
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {TYPE_LABEL[pot.type]}
            {pot.deadline ? ` · Due ${pot.deadline}` : ""}
            {pot.recurringAmount ? ` · ${fmt(pot.recurringAmount)}/mo` : ""}
          </p>
        </button>

        {/* Right side: amount + edit */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button onClick={onClick} className="text-right">
            <p
              className="text-sm font-bold"
              style={{ fontFamily: "var(--font-display)", color: pot.color }}
            >
              {fmt(pot.currentAmount)}
            </p>
            {pot.targetAmount && (
              <p
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                of {fmt(pot.targetAmount)}
              </p>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg transition-opacity hover:opacity-70"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-muted)",
            }}
          >
            <Icons.Pencil size={10} />
            Edit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {progress !== null && (
        <div
          className="mt-3 h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--color-surface-2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: pot.isCompleted ? "var(--color-income)" : pot.color,
            }}
          />
        </div>
      )}

      {/* Recurring reminder strip */}
      {showReminder && (
        <div
          className="mt-3 flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl"
          style={{
            background: "var(--color-warning)12",
            color: "var(--color-warning)",
          }}
        >
          <Icons.Bell size={11} />
          Tap to deposit your{" "}
          {pot.recurringAmount ? fmt(pot.recurringAmount) : "monthly"}{" "}
          contribution
        </div>
      )}
    </div>
  );
}
