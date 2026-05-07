import { useState } from "react";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useAppStore } from "../../store/useAppStore";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "../../constants/defaults";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

export function DangerZone() {
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const clearTransactions = async () => {
    if (!user) return;
    setLoading(true);
    await supabase.from("transactions").delete().eq("user_id", user.id);
    useAppStore.setState({ transactions: [] });
    setConfirmClear(false);
    setLoading(false);
  };

  const resetAll = async () => {
    if (!user) return;
    setLoading(true);

    // Wipe all user data from DB
    await Promise.all([
      supabase.from("transactions").delete().eq("user_id", user.id),
      supabase.from("budgets").delete().eq("user_id", user.id),
      supabase.from("categories").delete().eq("user_id", user.id),
      supabase.from("settings").delete().eq("user_id", user.id),
    ]);

    // Reset local state
    useAppStore.setState({
      transactions: [],
      budgets: [],
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,
    });

    setLoading(false);
    window.location.reload(); // loadAll will re-seed defaults on next mount
  };

  const btnBase =
    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 w-full disabled:opacity-40";

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={() => setConfirmClear(true)}
          disabled={loading}
          className={btnBase}
          style={{
            background: "var(--color-expense)15",
            color: "var(--color-expense)",
            border: "1px solid var(--color-expense)30",
          }}
        >
          <Trash2 size={15} />
          Clear all transactions
        </button>
        <button
          onClick={() => setConfirmReset(true)}
          disabled={loading}
          className={btnBase}
          style={{
            background: "var(--color-expense)25",
            color: "var(--color-expense)",
            border: "1px solid var(--color-expense)50",
          }}
        >
          <RotateCcw size={15} />
          Reset everything
        </button>
      </div>

      {/* Clear transactions dialog */}
      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              Clear all transactions?
            </AlertDialogTitle>
            <AlertDialogDescription
              style={{ color: "var(--color-text-muted)" }}
            >
              This will permanently delete all your transactions. Budgets and
              categories will remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={clearTransactions}
              disabled={loading}
              style={{ background: "var(--color-expense)", color: "white" }}
            >
              {loading ? "Clearing..." : "Clear All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Full reset dialog */}
      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              style={{
                color: "var(--color-expense)",
                fontFamily: "var(--font-display)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertTriangle size={18} /> Reset everything?
            </AlertDialogTitle>
            <AlertDialogDescription
              style={{ color: "var(--color-text-muted)" }}
            >
              This will wipe all transactions, budgets, custom categories, and
              settings. The app will return to its default state. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={resetAll}
              disabled={loading}
              style={{ background: "var(--color-expense)", color: "white" }}
            >
              {loading ? "Resetting..." : "Reset Everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
