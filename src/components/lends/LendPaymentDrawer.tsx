import { useState } from "react";
import { Drawer } from "vaul";
import { X, Trash2 } from "lucide-react";
import { useAppStore, getLendPaidTotal } from "../../store/useAppStore";
import { Lend, LendPayment } from "../../types";
import { useCurrency } from "../../hooks/useCurrency";
import { useAuth } from "../../hooks/useAuth";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  lend: Lend | null;
  payments: LendPayment[];
};

export function LendPaymentDrawer({ open, onClose, lend, payments }: Props) {
  const { format: fmt } = useCurrency();
  const { user } = useAuth();
  const addLendPayment = useAppStore((s) => s.addLendPayment);
  const removeLendPayment = useAppStore((s) => s.removeLendPayment);

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [removingPayment, setRemovingPayment] = useState<LendPayment | null>(
    null,
  );

  if (!lend) return null;

  const paid = getLendPaidTotal(payments, lend.id);
  const remaining = Math.max(Math.round((lend.amount - paid) * 100) / 100, 0);
  const pct = Math.min((paid / lend.amount) * 100, 100);

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (val > remaining) {
      setError(`Can't exceed remaining ${fmt(remaining)}`);
      return;
    }
    if (!user) {
      setError("Not signed in");
      return;
    }
    addLendPayment(lend.id, val, format(new Date(), "yyyy-MM-dd"), user.id);
    setAmount("");
    setError("");
  };

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
        <Drawer.Content className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className="pointer-events-auto w-full sm:max-w-md mx-4 sm:mx-0 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3 sm:hidden">
              <div
                className="w-10 h-1.5 rounded-full"
                style={{ background: "var(--color-border)" }}
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <Drawer.Title
                className="text-lg font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-primary)",
                }}
              >
                Log payment
              </Drawer.Title>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--color-surface-2)",
                  color: "var(--color-text-muted)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium truncate pr-2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {lend.title}
                </span>
                <span
                  className="text-xs font-bold shrink-0"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {Math.round(pct)}%
                </span>
              </div>
              <div
                className="h-2.5 rounded-full overflow-hidden"
                style={{ background: "var(--color-surface-2)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    background: "var(--color-income)",
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {fmt(paid)} received
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-expense)" }}
                >
                  {fmt(remaining)} left
                </span>
              </div>
            </div>

            {remaining > 0 && (
              <div className="mb-4">
                <label
                  className="text-xs font-medium block mb-1.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Amount received
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  placeholder={`Up to ${fmt(remaining)}`}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style={{
                    background: "var(--color-surface-2)",
                    border: `1px solid ${error ? "var(--color-expense)" : "var(--color-border)"}`,
                    color: "var(--color-text-primary)",
                  }}
                />
                {error && (
                  <p
                    className="text-xs mt-1.5"
                    style={{ color: "var(--color-expense)" }}
                  >
                    {error}
                  </p>
                )}
                <button
                  onClick={() => setAmount(String(remaining))}
                  className="text-xs font-semibold mt-1.5"
                  style={{ color: "var(--color-accent)" }}
                >
                  Fill remaining ({fmt(remaining)})
                </button>

                <button
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-xl text-sm font-bold mt-4"
                  style={{ background: "var(--color-accent)", color: "black" }}
                >
                  Log payment
                </button>
              </div>
            )}

            {payments.length > 0 && (
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Payment history
                </p>
                <div className="space-y-1.5">
                  {payments
                    .slice()
                    .sort((a, b) => b.paidOn.localeCompare(a.paidOn))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl"
                        style={{ background: "var(--color-surface-2)" }}
                      >
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {fmt(p.amount)}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {format(new Date(p.paidOn), "MMM d, yyyy")}
                          </p>
                        </div>
                        <button
                          onClick={() => setRemovingPayment(p)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: "var(--color-expense)18",
                            color: "var(--color-expense)",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>

      <AlertDialog
        open={!!removingPayment}
        onOpenChange={(o) => !o && setRemovingPayment(null)}
      >
        <AlertDialogContent
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Remove this payment?
            </AlertDialogTitle>
            <AlertDialogDescription
              style={{ color: "var(--color-text-muted)" }}
            >
              {removingPayment
                ? `${fmt(removingPayment.amount)} logged on ${format(new Date(removingPayment.paidOn), "MMM d, yyyy")} will be removed and the wallet balance will be adjusted.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setRemovingPayment(null)}
              style={{
                background: "transparent",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removingPayment) removeLendPayment(removingPayment.id);
                setRemovingPayment(null);
              }}
              style={{ background: "var(--color-expense)", color: "white" }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer.Root>
  );
}
