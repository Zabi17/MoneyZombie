import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Tag,
  BarChart3,
  Landmark,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { useCurrency } from "../../hooks/useCurrency";
import { useRunningBalance } from "../../hooks/useTransactions";
import { format } from "date-fns";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/budgets", icon: PiggyBank, label: "Budgets" },
  { to: "/savings", icon: Landmark, label: "Savings" },
  { to: "/categories", icon: Tag, label: "Categories" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const name = useAppStore((s) => s.settings.name);
  const { format: fmt } = useCurrency();
  const currentMonth = format(new Date(), "yyyy-MM");
  const balance = useRunningBalance(currentMonth);

  return (
    <aside
      className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40"
      style={{
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-accent)" }}
          >
            <Sparkles size={16} color="black" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            MoneyZombie
          </span>
        </div>
      </div>

      {/* Balance card */}
      <div
        className="mx-4 mb-6 rounded-xl p-4"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p
          className="text-xs font-medium mb-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          THIS MONTH
        </p>
        <p
          className="text-2xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color:
              balance >= 0 ? "var(--color-income)" : "var(--color-expense)",
          }}
        >
          {balance >= 0 ? "" : "-"}
          {fmt(Math.abs(balance))}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          {balance >= 0 ? "↑ net positive" : "↓ overspent"}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive ? "active-nav" : "inactive-nav"
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? "var(--color-surface-2)" : "transparent",
              color: isActive
                ? "var(--color-accent)"
                : "var(--color-text-secondary)",
            })}
          >
            <Icon size={18} />
            {label}
            {/* Active indicator dot */}
            <span
              className="ml-auto w-1.5 h-1.5 rounded-full opacity-0 transition-opacity"
              style={{ background: "var(--color-accent)" }}
              data-active="true"
            />
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 mt-auto">
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-xl"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--color-accent)", color: "black" }}
          >
            {name ? name[0].toUpperCase() : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {name || "Set your name"}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--color-text-muted)" }}
            >
              {format(new Date(), "MMMM yyyy")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
