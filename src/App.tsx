import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Welcome } from "./components/onboarding/Welcome";
import { useAppStore } from "./store/useAppStore";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  const loadAll = useAppStore((s) => s.loadAll);
  const loadState = useAppStore((s) => s.loadState);
  const name = useAppStore((s) => s.settings.name);

  useEffect(() => {
    loadAll();
  }, []);

  if (loadState === "idle" || loadState === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-background)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl animate-pulse"
            style={{ background: "var(--color-accent)" }}
          />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

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
            onClick={() => loadAll()}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: "var(--color-accent)", color: "black" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!name) return <Welcome />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="categories" element={<Categories />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        {/* Catch-all — outside AppLayout so it's full screen */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
