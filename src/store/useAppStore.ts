import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  Transaction,
  Category,
  Budget,
  AppSettings,
  SavingsPot,
  SavingsTransaction,
} from "../types";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "../constants/defaults";
import { supabase } from "../lib/supabase";

type LoadState = "idle" | "loading" | "ready" | "error";

type AppStore = {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  settings: AppSettings;
  savingsPots: SavingsPot[];
  savingsTransactions: SavingsTransaction[];
  loadState: LoadState;

  loadAll: (userId: string) => Promise<void>;
  reset: () => void;

  addTransaction: (
    t: Omit<Transaction, "id" | "createdAt">,
    userId: string,
  ) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addCategory: (c: Omit<Category, "id">, userId: string) => Promise<void>;
  updateCategory: (id: string, c: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  setBudget: (b: Omit<Budget, "id">, userId: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  updateSettings: (s: Partial<AppSettings>, userId: string) => Promise<void>;

  // ── Savings ──
  addPot: (
    p: Omit<
      SavingsPot,
      "id" | "createdAt" | "currentAmount" | "isCompleted" | "userId"
    >,
    userId: string,
  ) => Promise<void>;
  updatePot: (id: string, p: Partial<SavingsPot>) => Promise<void>;
  deletePot: (id: string) => Promise<void>;
  depositToPot: (
    potId: string,
    amount: number,
    note: string | undefined,
    userId: string,
  ) => Promise<void>;
  withdrawFromPot: (
    potId: string,
    amount: number,
    note: string | undefined,
    userId: string,
  ) => Promise<void>;
  transferBetweenPots: (
    fromPotId: string,
    toPotId: string,
    amount: number,
    note: string | undefined,
    userId: string,
  ) => Promise<void>;
};

export const useAppStore = create<AppStore>()((set, get) => ({
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  settings: DEFAULT_SETTINGS,
  savingsPots: [],
  savingsTransactions: [],
  loadState: "idle",

  reset: () =>
    set({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      budgets: [],
      settings: DEFAULT_SETTINGS,
      savingsPots: [],
      savingsTransactions: [],
      loadState: "idle",
    }),

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  loadAll: async (userId: string) => {
    set({ loadState: "loading" });
    try {
      const [txRes, catRes, budRes, setRes, potsRes, savTxRes] =
        await Promise.all([
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", userId)
            .order("date", { ascending: false }),
          supabase.from("categories").select("*").eq("user_id", userId),
          supabase.from("budgets").select("*").eq("user_id", userId),
          supabase.from("settings").select("*").eq("user_id", userId).single(),
          supabase
            .from("savings_pots")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
          supabase
            .from("savings_transactions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
        ]);

      const transactions: Transaction[] = (txRes.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        amount: Number(r.amount),
        type: r.type,
        categoryId: r.category_id,
        date: r.date,
        note: r.note ?? undefined,
        createdAt: r.created_at,
      }));

      const categories: Category[] =
        (catRes.data ?? []).length > 0
          ? catRes.data!.map((r) => ({
              id: r.id,
              name: r.name,
              icon: r.icon,
              color: r.color,
              type: r.type,
            }))
          : DEFAULT_CATEGORIES;

      if ((catRes.data ?? []).length === 0) {
        await supabase.from("categories").insert(
          DEFAULT_CATEGORIES.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            type: c.type,
            user_id: userId,
          })),
        );
        set({ categories: DEFAULT_CATEGORIES });
      }

      const budgets: Budget[] = (budRes.data ?? []).map((r) => ({
        id: r.id,
        categoryId: r.category_id,
        amount: Number(r.amount),
        month: r.month,
      }));

      const settings: AppSettings = setRes.data
        ? {
            currency: setRes.data.currency,
            name: setRes.data.name,
            theme: setRes.data.theme,
          }
        : DEFAULT_SETTINGS;

      if (!setRes.data) {
        await supabase.from("settings").insert({
          user_id: userId,
          currency: DEFAULT_SETTINGS.currency,
          name: DEFAULT_SETTINGS.name,
          theme: DEFAULT_SETTINGS.theme,
        });
      }

      const savingsPots: SavingsPot[] = (potsRes.data ?? []).map((r) => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        icon: r.icon,
        color: r.color,
        type: r.type,
        currentAmount: Number(r.current_amount),
        isCompleted: r.is_completed,
        createdAt: r.created_at,
        targetAmount: r.target_amount ? Number(r.target_amount) : undefined,
        deadline: r.deadline ?? undefined,
        recurringAmount: r.recurring_amount
          ? Number(r.recurring_amount)
          : undefined,
        isLocked: r.is_locked ?? undefined,
        floorAmount: r.floor_amount ? Number(r.floor_amount) : undefined,
      }));

      const savingsTransactions: SavingsTransaction[] = (
        savTxRes.data ?? []
      ).map((r) => ({
        id: r.id,
        userId: r.user_id,
        type: r.type,
        amount: Number(r.amount),
        fromPotId: r.from_pot_id ?? null,
        toPotId: r.to_pot_id ?? null,
        note: r.note ?? undefined,
        createdAt: r.created_at,
      }));

      set({
        transactions,
        categories,
        budgets,
        settings,
        savingsPots,
        savingsTransactions,
        loadState: "ready",
      });
    } catch (e) {
      console.error("loadAll failed", e);
      set({ loadState: "error" });
    }
  },

  // ── Transactions ───────────────────────────────────────────────────────────
  addTransaction: async (t, userId) => {
    const id = nanoid();
    const createdAt = new Date().toISOString();
    set((s) => ({
      transactions: [{ ...t, id, createdAt }, ...s.transactions],
    }));
    await supabase.from("transactions").insert({
      id,
      title: t.title,
      amount: t.amount,
      type: t.type,
      category_id: t.categoryId,
      date: t.date,
      note: t.note ?? null,
      created_at: createdAt,
      user_id: userId,
    });
  },

  updateTransaction: async (id, t) => {
    set((s) => ({
      transactions: s.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...t } : tx,
      ),
    }));
    await supabase
      .from("transactions")
      .update({
        ...(t.title !== undefined && { title: t.title }),
        ...(t.amount !== undefined && { amount: t.amount }),
        ...(t.type !== undefined && { type: t.type }),
        ...(t.categoryId !== undefined && { category_id: t.categoryId }),
        ...(t.date !== undefined && { date: t.date }),
        ...(t.note !== undefined && { note: t.note }),
      })
      .eq("id", id);
  },

  deleteTransaction: async (id) => {
    set((s) => ({
      transactions: s.transactions.filter((tx) => tx.id !== id),
    }));
    await supabase.from("transactions").delete().eq("id", id);
  },

  // ── Categories ─────────────────────────────────────────────────────────────
  addCategory: async (c, userId) => {
    const id = nanoid();
    set((s) => ({ categories: [...s.categories, { ...c, id }] }));
    await supabase.from("categories").insert({
      id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type,
      user_id: userId,
    });
  },

  updateCategory: async (id, c) => {
    set((s) => ({
      categories: s.categories.map((cat) =>
        cat.id === id ? { ...cat, ...c } : cat,
      ),
    }));
    await supabase
      .from("categories")
      .update({
        ...(c.name !== undefined && { name: c.name }),
        ...(c.icon !== undefined && { icon: c.icon }),
        ...(c.color !== undefined && { color: c.color }),
        ...(c.type !== undefined && { type: c.type }),
      })
      .eq("id", id);
  },

  deleteCategory: async (id) => {
    set((s) => ({
      categories: s.categories.filter((cat) => cat.id !== id),
    }));
    await supabase.from("categories").delete().eq("id", id);
  },

  // ── Budgets ────────────────────────────────────────────────────────────────
  setBudget: async (b, userId) => {
    const existing = get().budgets.find(
      (x) => x.categoryId === b.categoryId && x.month === b.month,
    );
    if (existing) {
      set((s) => ({
        budgets: s.budgets.map((x) =>
          x.id === existing.id ? { ...x, amount: b.amount } : x,
        ),
      }));
      await supabase
        .from("budgets")
        .update({ amount: b.amount })
        .eq("id", existing.id);
    } else {
      const id = nanoid();
      set((s) => ({ budgets: [...s.budgets, { ...b, id }] }));
      await supabase.from("budgets").insert({
        id,
        category_id: b.categoryId,
        amount: b.amount,
        month: b.month,
        user_id: userId,
      });
    }
  },

  deleteBudget: async (id) => {
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
    await supabase.from("budgets").delete().eq("id", id);
  },

  // ── Settings ───────────────────────────────────────────────────────────────
  updateSettings: async (s, userId) => {
    set((state) => ({ settings: { ...state.settings, ...s } }));
    await supabase
      .from("settings")
      .update({
        ...(s.currency !== undefined && { currency: s.currency }),
        ...(s.name !== undefined && { name: s.name }),
        ...(s.theme !== undefined && { theme: s.theme }),
      })
      .eq("user_id", userId);
  },

  // ── Savings Pots ───────────────────────────────────────────────────────────
  addPot: async (p, userId) => {
    const id = nanoid();
    const createdAt = new Date().toISOString();
    const newPot: SavingsPot = {
      ...p,
      id,
      userId,
      currentAmount: 0,
      isCompleted: false,
      createdAt,
    };
    set((s) => ({ savingsPots: [newPot, ...s.savingsPots] }));
    await supabase.from("savings_pots").insert({
      id,
      user_id: userId,
      name: p.name,
      icon: p.icon,
      color: p.color,
      type: p.type,
      current_amount: 0,
      is_completed: false,
      created_at: createdAt,
      target_amount: p.targetAmount ?? null,
      deadline: p.deadline ?? null,
      recurring_amount: p.recurringAmount ?? null,
      is_locked: p.isLocked ?? false,
      floor_amount: p.floorAmount ?? null,
    });
  },

  updatePot: async (id, p) => {
    set((s) => ({
      savingsPots: s.savingsPots.map((pot) =>
        pot.id === id ? { ...pot, ...p } : pot,
      ),
    }));
    await supabase
      .from("savings_pots")
      .update({
        ...(p.name !== undefined && { name: p.name }),
        ...(p.icon !== undefined && { icon: p.icon }),
        ...(p.color !== undefined && { color: p.color }),
        ...(p.targetAmount !== undefined && { target_amount: p.targetAmount }),
        ...(p.deadline !== undefined && { deadline: p.deadline }),
        ...(p.recurringAmount !== undefined && {
          recurring_amount: p.recurringAmount,
        }),
        ...(p.isLocked !== undefined && { is_locked: p.isLocked }),
        ...(p.floorAmount !== undefined && { floor_amount: p.floorAmount }),
        ...(p.isCompleted !== undefined && { is_completed: p.isCompleted }),
        ...(p.currentAmount !== undefined && {
          current_amount: p.currentAmount,
        }),
      })
      .eq("id", id);
  },

  deletePot: async (id) => {
    set((s) => ({
      savingsPots: s.savingsPots.filter((p) => p.id !== id),
      savingsTransactions: s.savingsTransactions.filter(
        (t) => t.fromPotId !== id && t.toPotId !== id,
      ),
    }));
    await supabase.from("savings_pots").delete().eq("id", id);
  },

  // ── Savings Transactions ───────────────────────────────────────────────────
  depositToPot: async (potId, amount, note, userId) => {
    const id = nanoid();
    const txId = nanoid();
    const createdAt = new Date().toISOString();
    const date = createdAt.slice(0, 10);
    const pot = get().savingsPots.find((p) => p.id === potId);

    set((s) => ({
      savingsPots: s.savingsPots.map((p) => {
        if (p.id !== potId) return p;
        const newAmount = p.currentAmount + amount;
        return {
          ...p,
          currentAmount: newAmount,
          isCompleted: p.targetAmount
            ? newAmount >= p.targetAmount
            : p.isCompleted,
        };
      }),
      savingsTransactions: [
        {
          id,
          userId,
          type: "deposit",
          amount,
          fromPotId: null,
          toPotId: potId,
          note,
          createdAt,
        },
        ...s.savingsTransactions,
      ],
      transactions: [
        {
          id: txId,
          title: `Saved to ${pot?.name ?? "pot"}`,
          amount,
          type: "transfer",
          categoryId: "savings",
          date,
          note,
          createdAt,
        },
        ...s.transactions,
      ],
    }));

    const updatedPot = get().savingsPots.find((p) => p.id === potId);

    await Promise.all([
      supabase.from("savings_transactions").insert({
        id,
        user_id: userId,
        type: "deposit",
        amount,
        from_pot_id: null,
        to_pot_id: potId,
        note: note ?? null,
        created_at: createdAt,
      }),
      supabase
        .from("savings_pots")
        .update({
          current_amount: updatedPot?.currentAmount,
          is_completed: updatedPot?.isCompleted,
        })
        .eq("id", potId),
      supabase.from("transactions").insert({
        id: txId,
        user_id: userId,
        title: `Saved to ${pot?.name ?? "pot"}`,
        amount,
        type: "transfer",
        category_id: "savings",
        date,
        note: note ?? null,
        created_at: createdAt,
      }),
    ]);
  },

  withdrawFromPot: async (potId, amount, note, userId) => {
    const id = nanoid();
    const txId = nanoid();
    const createdAt = new Date().toISOString();
    const date = createdAt.slice(0, 10);
    const pot = get().savingsPots.find((p) => p.id === potId);

    set((s) => ({
      savingsPots: s.savingsPots.map((p) =>
        p.id === potId ? { ...p, currentAmount: p.currentAmount - amount } : p,
      ),
      savingsTransactions: [
        {
          id,
          userId,
          type: "withdrawal",
          amount,
          fromPotId: potId,
          toPotId: null,
          note,
          createdAt,
        },
        ...s.savingsTransactions,
      ],
      transactions: [
        {
          id: txId,
          title: `Withdrawn from ${pot?.name ?? "pot"}`,
          amount,
          type: "transfer",
          categoryId: "savings",
          date,
          note,
          createdAt,
        },
        ...s.transactions,
      ],
    }));

    const updatedPot = get().savingsPots.find((p) => p.id === potId);

    await Promise.all([
      supabase.from("savings_transactions").insert({
        id,
        user_id: userId,
        type: "withdrawal",
        amount,
        from_pot_id: potId,
        to_pot_id: null,
        note: note ?? null,
        created_at: createdAt,
      }),
      supabase
        .from("savings_pots")
        .update({
          current_amount: updatedPot?.currentAmount,
        })
        .eq("id", potId),
      supabase.from("transactions").insert({
        id: txId,
        user_id: userId,
        title: `Withdrawn from ${pot?.name ?? "pot"}`,
        amount,
        type: "transfer",
        category_id: "savings",
        date,
        note: note ?? null,
        created_at: createdAt,
      }),
    ]);
  },

  transferBetweenPots: async (fromPotId, toPotId, amount, note, userId) => {
    const id = nanoid();
    const createdAt = new Date().toISOString();

    // Pot-to-pot transfer does NOT create a wallet transaction
    // since money never leaves your total savings
    set((s) => ({
      savingsPots: s.savingsPots.map((p) => {
        if (p.id === fromPotId)
          return { ...p, currentAmount: p.currentAmount - amount };
        if (p.id === toPotId) {
          const newAmount = p.currentAmount + amount;
          return {
            ...p,
            currentAmount: newAmount,
            isCompleted: p.targetAmount
              ? newAmount >= p.targetAmount
              : p.isCompleted,
          };
        }
        return p;
      }),
      savingsTransactions: [
        {
          id,
          userId,
          type: "transfer",
          amount,
          fromPotId,
          toPotId,
          note,
          createdAt,
        },
        ...s.savingsTransactions,
      ],
    }));

    const fromPot = get().savingsPots.find((p) => p.id === fromPotId);
    const toPot = get().savingsPots.find((p) => p.id === toPotId);

    await Promise.all([
      supabase.from("savings_transactions").insert({
        id,
        user_id: userId,
        type: "transfer",
        amount,
        from_pot_id: fromPotId,
        to_pot_id: toPotId,
        note: note ?? null,
        created_at: createdAt,
      }),
      supabase
        .from("savings_pots")
        .update({
          current_amount: fromPot?.currentAmount,
        })
        .eq("id", fromPotId),
      supabase
        .from("savings_pots")
        .update({
          current_amount: toPot?.currentAmount,
          is_completed: toPot?.isCompleted,
        })
        .eq("id", toPotId),
    ]);
  },
}));
