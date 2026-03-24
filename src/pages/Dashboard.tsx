import { useState } from "react";
import { format } from "date-fns";
import { TrendingDown, TrendingUp, Wallet, Plus, Minus } from "lucide-react";
import { StatCard } from "../components/ui/StatCard";
import { SpendingPieChart } from "../components/dashboard/SpendingPieChart";
import { CategoryBreakdown } from "../components/dashboard/CategoryBreakdown";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { MonthSelector } from "../components/dashboard/MonthSelector";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { useTransactions } from "../hooks/useTransactions";
import { useCurrency } from "../hooks/useCurrency";
import { useAppStore } from "../store/useAppStore";
import { TransactionType } from "../types";

export default function Dashboard() {
  const [activeDate, setActiveDate] = useState(new Date());
  const currentMonth = format(activeDate, "yyyy-MM");
  const { totalExpense, totalIncome, balance } = useTransactions(currentMonth);
  const { format: fmt } = useCurrency();
  const name = useAppStore((s) => s.settings.name);

  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>("expense");

  const openForm = (type: TransactionType) => {
    setFormType(type);
    setFormOpen(true);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {greeting()}
            {name ? `, ${name}` : ""}
          </p>
          <h1
            className="text-2xl font-bold mt-0.5"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Overview
          </h1>
        </div>

        {/* Two buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => openForm("expense")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-expense)20",
              color: "var(--color-expense)",
              border: "1px solid firebrick",
            }}
          >
            <Minus size={15}/>
            <span className="hidden sm:inline">Sub</span>
          </button>
          <button
            onClick={() => openForm("income")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
            style={{ background: "var(--color-accent)", color: "black" }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Month selector */}
      <MonthSelector date={activeDate} onChange={setActiveDate} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Balance"
          value={`${balance < 0 ? "-" : ""}${fmt(Math.abs(balance))}`}
          sub={balance >= 0 ? "Positive balance" : "Overspent this month"}
          accent={balance >= 0 ? "var(--color-income)" : "var(--color-expense)"}
          icon={<Wallet size={18} />}
        />
        <StatCard
          label="Income"
          value={fmt(totalIncome)}
          sub={format(activeDate, "MMMM yyyy")}
          accent="var(--color-income)"
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="Expenses"
          value={fmt(totalExpense)}
          sub={format(activeDate, "MMMM yyyy")}
          accent="var(--color-expense)"
          icon={<TrendingDown size={18} />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-muted)",
            }}
          >
            Spending Split
          </h2>
          <SpendingPieChart />
        </div>

        <div
          className="rounded-2xl p-5"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-muted)",
            }}
          >
            Top Categories
          </h2>
          <CategoryBreakdown />
        </div>
      </div>

      {/* Recent transactions */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-widest mb-4"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-muted)",
          }}
        >
          Recent Transactions
        </h2>
        <RecentTransactions />
      </div>

      {/* Inline form — no navigation needed */}
      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={null}
        initialType={formType}
      />
    </div>
  );
}
