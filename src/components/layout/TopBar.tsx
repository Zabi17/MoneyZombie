import { useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/budgets": "Budgets",
  "/categories": "Categories",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function TopBar() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "MoneyZombie";

  return (
    <header
      className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14"
      style={{
        background: "var(--color-background)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: "var(--color-accent)" }}
        >
          <Sparkles size={12} color="black" />
        </div>
        <span
          className="font-bold text-base"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </span>
      </div>
    </header>
  );
}
