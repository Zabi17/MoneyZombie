import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Settings,
} from "lucide-react";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Txns" },
  { to: "/budgets", icon: PiggyBank, label: "Budgets" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-2xl shadow-2xl"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200"
          style={({ isActive }) => ({
            background: isActive ? "var(--color-surface-2)" : "transparent",
            color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium mt-0.5">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
