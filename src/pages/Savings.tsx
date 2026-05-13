import { useState } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useCurrency } from "../hooks/useCurrency";
import { SavingsPot } from "../types";
import { PotCard } from "@/components/savings/PotCard";
import { EditPotSheet } from "@/components/savings/EditPotSheet";
import { PotDrawer } from "@/components/savings/PotDrawer";
import { AddPotSheet } from "@/components/savings/AddPotSheet";

export default function Savings() {
  const savingsPots = useAppStore((s) => s.savingsPots);
  const savingsTransactions = useAppStore((s) => s.savingsTransactions);
  const { format: fmt } = useCurrency();

  const [selectedPot, setSelectedPot] = useState<SavingsPot | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingPot, setEditingPot] = useState<SavingsPot | null>(null);

  const totalSaved = savingsPots.reduce((acc, p) => acc + p.currentAmount, 0);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-widest mb-0.5"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            Your Pots
          </p>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Savings
          </h1>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
          style={{ background: "var(--color-accent)", color: "black" }}
        >
          <Plus size={15} />
          New Pot
        </button>
      </div>

      {/* Total saved banner */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p
          className="text-xs font-medium uppercase tracking-widest mb-1"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-display)",
          }}
        >
          Total Saved
        </p>
        <p
          className="text-3xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-accent)",
          }}
        >
          {fmt(totalSaved)}
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          Across {savingsPots.length} pot{savingsPots.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Pots list */}
      {savingsPots.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            No pots yet
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Tap "New Pot" to create your first savings goal
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savingsPots.map((pot) => (
            <PotCard
              key={pot.id}
              pot={pot}
              onClick={() => setSelectedPot(pot)}
              onEdit={() => setEditingPot(pot)}
            />
          ))}
        </div>
      )}

      {/* Pot action drawer */}
      <PotDrawer
        pot={selectedPot}
        onClose={() => setSelectedPot(null)}
        savingsTransactions={savingsTransactions.filter(
          (t) =>
            t.fromPotId === selectedPot?.id || t.toPotId === selectedPot?.id,
        )}
      />

      {/* Add pot sheet */}
      <AddPotSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <EditPotSheet pot={editingPot} onClose={() => setEditingPot(null)} />
    </div>
  );
}
