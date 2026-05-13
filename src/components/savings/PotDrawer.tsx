import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { SavingsPot, SavingsTransaction } from "../../types";
import { useCurrency } from "../../hooks/useCurrency";
import { useAppStore } from "../../store/useAppStore";
import { useAuth } from "../../hooks/useAuth";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Trash2,
  Lock,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import * as Icons from "lucide-react";

type Action = "deposit" | "withdrawal" | "transfer" | null;

type Props = {
  pot: SavingsPot | null;
  onClose: () => void;
  savingsTransactions: SavingsTransaction[];
};

export function PotDrawer({ pot, onClose, savingsTransactions }: Props) {
  const { format: fmt, symbol } = useCurrency();
  const { user } = useAuth();
  const depositToPot = useAppStore((s) => s.depositToPot);
  const withdrawFromPot = useAppStore((s) => s.withdrawFromPot);
  const transferBetweenPots = useAppStore((s) => s.transferBetweenPots);
  const deletePot = useAppStore((s) => s.deletePot);
  const savingsPots = useAppStore((s) => s.savingsPots);

  const [action, setAction] = useState<Action>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setAction(null);
    setAmount("");
    setNote("");
    setTransferTo("");
    setShowWarning(false);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAction = async () => {
    if (!pot || !user) return;
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0)
      return setError("Enter a valid amount");

    // Withdrawal guard
    if (action === "withdrawal") {
      if (amt > pot.currentAmount)
        return setError("Amount exceeds pot balance");
      const floorBreached =
        pot.floorAmount !== undefined &&
        pot.currentAmount - amt < pot.floorAmount;
      if ((pot.isLocked || floorBreached) && !showWarning) {
        setShowWarning(true);
        return;
      }
    }

    if (action === "transfer") {
      if (!transferTo) return setError("Select a destination pot");
      if (amt > pot.currentAmount)
        return setError("Amount exceeds pot balance");
      await transferBetweenPots(
        pot.id,
        transferTo,
        amt,
        note || undefined,
        user.id,
      );
    } else if (action === "deposit") {
      await depositToPot(pot.id, amt, note || undefined, user.id);
    } else if (action === "withdrawal") {
      await withdrawFromPot(pot.id, amt, note || undefined, user.id);
    }

    reset();
    onClose();
  };

  const otherPots = savingsPots.filter((p) => p.id !== pot?.id);

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none";
  const inputStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
  };

  if (!pot) return null;

  const IconComp = (Icons as any)[pot.icon] ?? Icons.PiggyBank;
  const progress =
    pot.targetAmount && pot.targetAmount > 0
      ? Math.min((pot.currentAmount / pot.targetAmount) * 100, 100)
      : null;

  return (
    <Sheet open={!!pot} onOpenChange={(v) => !v && handleClose()}>
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
            className="flex items-center gap-3"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${pot.color}20` }}
            >
              <IconComp size={18} style={{ color: pot.color }} />
            </div>
            {pot.name}
            {pot.isLocked && (
              <Lock size={14} style={{ color: "var(--color-warning)" }} />
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Balance */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: "var(--color-surface-2)" }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Current Balance
          </p>
          <p
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: pot.color }}
          >
            {fmt(pot.currentAmount)}
          </p>
          {pot.targetAmount && (
            <>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Target: {fmt(pot.targetAmount)}
                {pot.deadline ? ` · Due ${pot.deadline}` : ""}
              </p>
              <div
                className="mt-2 h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--color-border)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: pot.isCompleted
                      ? "var(--color-income)"
                      : pot.color,
                  }}
                />
              </div>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                {Math.round(progress ?? 0)}% reached
              </p>
            </>
          )}
        </div>

        {/* Action buttons */}
        {!action && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              {
                key: "withdrawal",
                label: "Withdraw",
                icon: ArrowUpRight,
                color: "expense",
                bgColor: "var(--color-expense)",
              },
              {
                key: "transfer",
                label: "Transfer",
                icon: ArrowLeftRight,
                color: "dash",
                bgColor: "var(--color-dash)",
              },
              {
                key: "deposit",
                label: "Deposit",
                icon: ArrowDownLeft,
                color: "income",
                bgColor: "var(--color-income)",
              },
            ].map(({ key, label, icon: Icon, color, bgColor }) => (
              <button
                key={key}
                onClick={() => setAction(key as Action)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all hover:opacity-80 hover:scale-105 active:scale-95"
                style={{
                  background: `${bgColor}15`,
                  border: `1px solid ${bgColor}50`,
                  color: bgColor,
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Transaction history */}
        {savingsTransactions.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-display)",
              }}
            >
              History
            </p>
            <div className="space-y-2">
              {savingsTransactions.slice(0, 10).map((tx) => {
                const isIn = tx.toPotId === pot.id;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                    style={{ background: "var(--color-surface-2)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: isIn
                            ? "var(--color-income)15"
                            : "var(--color-expense)15",
                        }}
                      >
                        {tx.type === "transfer" ? (
                          <ArrowLeftRight
                            size={12}
                            style={{ color: "var(--color-dash)" }}
                          />
                        ) : isIn ? (
                          <ArrowDownLeft
                            size={12}
                            style={{ color: "var(--color-income)" }}
                          />
                        ) : (
                          <ArrowUpRight
                            size={12}
                            style={{ color: "var(--color-expense)" }}
                          />
                        )}
                      </div>
                      <div>
                        <p
                          className="text-xs font-medium capitalize"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {tx.type}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {tx.note ??
                            format(new Date(tx.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: isIn
                          ? "var(--color-income)"
                          : "var(--color-expense)",
                      }}
                    >
                      {isIn ? "+" : "-"}
                      {fmt(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delete pot */}
        <button
          onClick={() => {
            deletePot(pot.id);
            handleClose();
          }}
          className="flex items-center gap-2 mt-5 text-xs font-medium px-3 py-2 rounded-xl transition-opacity hover:opacity-70"
          style={{
            background: "var(--color-expense)12",
            color: "var(--color-expense)",
            border: "1px solid var(--color-expense)25",
          }}
        >
          <Trash2 size={13} />
          Delete this pot
        </button>
      </SheetContent>
    </Sheet>
  );
}
