import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loader from "./components/ui/Loader";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginScreen } from "./components/auth/LoginScreen";
import { Welcome } from "./components/onboarding/Welcome";
import { useAppStore } from "./store/useAppStore";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Savings from "./pages/Savings";
import Budgets from "./pages/Budgets";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const loadAll = useAppStore((s) => s.loadAll);
  const reset = useAppStore((s) => s.reset);
  const loadState = useAppStore((s) => s.loadState);
  const name = useAppStore((s) => s.settings.name);

  // When user logs in, load their data. When they log out, clear it.
  useEffect(() => {
    if (user) {
      loadAll(user.id);
    } else if (!authLoading) {
      reset();
    }
  }, [user, authLoading]);

  // ── Loading states ──────────────────────────────────────────────────────
  if (
    authLoading ||
    (user && loadState === "idle") ||
    loadState === "loading"
  ) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-background)" }}
      >
        <Loader color="var(--color-accent)" />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (loadState === "error") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--color-background)" }}
      >
        <div className="text-center space-y-3">
          <p
            className="text-lg font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Connection failed
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Could not reach the database. Check your internet connection.
          </p>
          <button
            onClick={() => user && loadAll(user.id)}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: "var(--color-accent)", color: "black" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!user) return <LoginScreen />;

  // ── Logged in but no name yet (new user) ────────────────────────────────
  if (!name) return <Welcome userId={user.id} />;

  // ── Main app ─────────────────────────────────────────────────────────────
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="savings" element={<Savings />} />
          <Route path="categories" element={<Categories />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
