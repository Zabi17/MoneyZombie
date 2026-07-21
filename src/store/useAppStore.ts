import { create } from "zustand";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  Transaction,
  Category,
  Budget,
  AppSettings,
  SavingsPot,
  SavingsTransaction,
  Lend,
  LendPayment,
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
  lends: Lend[];
  lendPayments: LendPayment[];
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

  addBudget: (b: Omit<Budget, "id">, userId: string) => Promise<void>;
  updateBudget: (id: string, amount: number) => Promise<void>;
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

  // ── Lends ──
  addLend: (
    data: {
      title: string;
      amount: number;
      categoryId: string;
      note?: string;
      lentOn: string;
    },
    userId: string,
  ) => Promise<void>;
  updateLend: (
    id: string,
    data: Partial<
      Pick<Lend, "title" | "amount" | "categoryId" | "note" | "lentOn">
    >,
  ) => Promise<boolean>;
  addLendPayment: (
    lendId: string,
    amount: number,
    paidOn: string,
    userId: string,
  ) => Promise<void>;
  removeLendPayment: (paymentId: string) => Promise<void>;
  deleteLend: (lendId: string) => Promise<void>;
};

export const getLendPaidTotal = (payments: LendPayment[], lendId: string) =>
  Math.round(
    payments
      .filter((p) => p.lendId === lendId)
      .reduce((s, p) => s + p.amount, 0) * 100,
  ) / 100;

export const useAppStore = create<AppStore>()((set, get) => ({
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  settings: DEFAULT_SETTINGS,
  savingsPots: [],
  savingsTransactions: [],
  lends: [],
  lendPayments: [],
  loadState: "idle",

  reset: () =>
    set({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      budgets: [],
      settings: DEFAULT_SETTINGS,
      savingsPots: [],
      savingsTransactions: [],
      lends: [],
      lendPayments: [],
      loadState: "idle",
    }),

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  loadAll: async (userId: string) => {
    set({ loadState: "loading" });
    try {
      const [
        txRes,
        catRes,
        budRes,
        setRes,
        potsRes,
        savTxRes,
        lendsRes,
        lendPayRes,
      ] = await Promise.all([
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
        supabase
          .from("lends")
          .select("*")
          .eq("user_id", userId)
          .order("lent_on", { ascending: false }),
        supabase
          .from("lend_payments")
          .select("*")
          .eq("user_id", userId)
          .order("paid_on", { ascending: false }),
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
        await supabase.from("settings").upsert(
          {
            user_id: userId,
            currency: DEFAULT_SETTINGS.currency,
            name: DEFAULT_SETTINGS.name,
            theme: DEFAULT_SETTINGS.theme,
          },
          { onConflict: "user_id" },
        );
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

      const lends: Lend[] = (lendsRes.data ?? []).map((r) => ({
        id: r.id,
        userId: r.user_id,
        title: r.title,
        amount: Number(r.amount),
        categoryId: r.category_id,
        note: r.note ?? undefined,
        lentOn: r.lent_on,
        settledOn: r.settled_on ?? null,
        walletDebitTxId: r.wallet_debit_tx_id,
        createdAt: r.created_at,
      }));

      const lendPayments: LendPayment[] = (lendPayRes.data ?? []).map((r) => ({
        id: r.id,
        userId: r.user_id,
        lendId: r.lend_id,
        amount: Number(r.amount),
        paidOn: r.paid_on,
        txId: r.tx_id,
        createdAt: r.created_at,
      }));

      set({
        transactions,
        categories,
        budgets,
        settings,
        savingsPots,
        savingsTransactions,
        lends,
        lendPayments,
        loadState: "ready",
      });
    } catch (e) {
      console.error("loadAll failed", e);
      set({ loadState: "error" });
    }
  },

  // ── Transactions ───────────────────────────────────────────────────────────
  addTransaction: async (t, userId) => {
    try {
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
      toast.success("Transaction added");
    } catch (error) {
      toast.error("Failed to add transaction");
      console.error(error);
    }
  },

  updateTransaction: async (id, t) => {
    try {
      set((s) => ({
        transactions: s.transactions.map((tx) =>
          tx.id === id ? { ...tx, ...t } : tx,
        ),
      }));

      const { error } = await supabase
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

      if (error) throw error;

      toast.success("Transaction updated");
    } catch (error) {
      toast.error("Failed to update transaction");
      console.error(error);
    }
  },

  deleteTransaction: async (id) => {
    try {
      set((s) => ({
        transactions: s.transactions.filter((tx) => tx.id !== id),
      }));
      await supabase.from("transactions").delete().eq("id", id);
      toast.warning("Transaction deleted");
    } catch (error) {
      toast.error("Failed to delete transaction");
      console.error(error);
    }
  },

  // ── Categories ─────────────────────────────────────────────────────────────
  addCategory: async (c, userId) => {
    try {
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
      toast.success("Category created");
    } catch (error) {
      toast.error("Failed to add category");
      console.error(error);
    }
  },

  updateCategory: async (id, c) => {
    try {
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
      toast.success("Category created");
    } catch (error) {
      toast.error("Failed to update category");
      console.error(error);
    }
  },

  deleteCategory: async (id) => {
    try {
      set((s) => ({
        categories: s.categories.filter((cat) => cat.id !== id),
      }));
      await supabase.from("categories").delete().eq("id", id);
      toast.warning("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
      console.error(error);
    }
  },

  // ── Budgets ────────────────────────────────────────────────────────────────
  addBudget: async (b, userId) => {
    try {
      const id = nanoid();
      set((s) => ({ budgets: [...s.budgets, { ...b, id }] }));
      await supabase.from("budgets").insert({
        id,
        category_id: b.categoryId,
        amount: b.amount,
        month: b.month,
        user_id: userId,
      });
      toast.success("Budget created");
    } catch (error) {
      toast.error("Failed to create budget");
      console.error(error);
    }
  },

  updateBudget: async (id, amount) => {
    try {
      set((s) => ({
        budgets: s.budgets.map((x) => (x.id === id ? { ...x, amount } : x)),
      }));
      await supabase.from("budgets").update({ amount }).eq("id", id);
      toast.success("Budget updated");
    } catch (error) {
      toast.error("Failed to update budget");
      console.error(error);
    }
  },

  deleteBudget: async (id) => {
    try {
      set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
      await supabase.from("budgets").delete().eq("id", id);
      toast.warning("Budget deleted");
    } catch (error) {
      toast.error("Failed to delete budget");
      console.error(error);
    }
  },

  // ── Settings ───────────────────────────────────────────────────────────────
  updateSettings: async (s, userId) => {
    try {
      set((state) => ({ settings: { ...state.settings, ...s } }));
      await supabase
        .from("settings")
        .update({
          ...(s.currency !== undefined && { currency: s.currency }),
          ...(s.name !== undefined && { name: s.name }),
          ...(s.theme !== undefined && { theme: s.theme }),
        })
        .eq("user_id", userId);
      toast.success("Settings saved");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    }
  },

  // ── Savings Pots ───────────────────────────────────────────────────────────
  addPot: async (p, userId) => {
    try {
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
      toast.success("Pot created");
    } catch (error) {
      toast.error("Failed to create pot");
      console.error(error);
    }
  },

  updatePot: async (id, p) => {
    try {
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
          ...(p.targetAmount !== undefined && {
            target_amount: p.targetAmount,
          }),
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
      toast.success("Pot updated");
    } catch (error) {
      toast.error("Failed to update pot");
      console.error(error);
    }
  },

  deletePot: async (id) => {
    try {
      set((s) => ({
        savingsPots: s.savingsPots.filter((p) => p.id !== id),
        savingsTransactions: s.savingsTransactions.filter(
          (t) => t.fromPotId !== id && t.toPotId !== id,
        ),
      }));
      await supabase.from("savings_pots").delete().eq("id", id);
      toast.warning("Pot deleted");
    } catch (error) {
      toast.error("Failed to delete pot");
      console.error(error);
    }
  },

  depositToPot: async (potId, amount, note, userId) => {
    try {
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
      toast.success("Deposit saved");
    } catch (error) {
      toast.error("Failed to deposit to pot");
      console.error(error);
    }
  },

  withdrawFromPot: async (potId, amount, note, userId) => {
    try {
      const id = nanoid();
      const txId = nanoid();
      const createdAt = new Date().toISOString();
      const date = createdAt.slice(0, 10);
      const pot = get().savingsPots.find((p) => p.id === potId);

      set((s) => ({
        savingsPots: s.savingsPots.map((p) =>
          p.id === potId
            ? { ...p, currentAmount: p.currentAmount - amount }
            : p,
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
          .update({ current_amount: updatedPot?.currentAmount })
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
      toast.success("Withdrawal successful");
    } catch (error) {
      toast.error("Failed to withdraw from pot");
      console.error(error);
    }
  },

  transferBetweenPots: async (fromPotId, toPotId, amount, note, userId) => {
    try {
      const id = nanoid();
      const createdAt = new Date().toISOString();

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
          .update({ current_amount: fromPot?.currentAmount })
          .eq("id", fromPotId),
        supabase
          .from("savings_pots")
          .update({
            current_amount: toPot?.currentAmount,
            is_completed: toPot?.isCompleted,
          })
          .eq("id", toPotId),
      ]);
      toast.success("Transfer successful");
    } catch (error) {
      toast.error("Failed to transfer between pots");
      console.error(error);
    }
  },

  // ── Lends ──────────────────────────────────────────────────────────────────
  addLend: async (data, userId) => {
    try {
      const lendId = nanoid();
      const debitTxId = nanoid();
      const createdAt = new Date().toISOString();

      const debitTx: Transaction = {
        id: debitTxId,
        title: `Lent · ${data.title}`,
        amount: data.amount,
        type: "transfer", // hidden from income/expense stats
        categoryId: data.categoryId,
        date: data.lentOn,
        note: data.note,
        createdAt,
      };

      const lend: Lend = {
        id: lendId,
        userId,
        title: data.title,
        amount: data.amount,
        categoryId: data.categoryId,
        note: data.note,
        lentOn: data.lentOn,
        settledOn: null,
        walletDebitTxId: debitTxId,
        createdAt,
      };

      // Optimistic
      set((s) => ({
        lends: [lend, ...s.lends],
        transactions: [debitTx, ...s.transactions],
      }));

      await Promise.all([
        supabase.from("transactions").insert({
          id: debitTxId,
          user_id: userId,
          title: debitTx.title,
          amount: data.amount,
          type: "transfer",
          category_id: data.categoryId,
          date: data.lentOn,
          note: data.note ?? null,
          created_at: createdAt,
        }),
        supabase.from("lends").insert({
          id: lendId,
          user_id: userId,
          title: data.title,
          amount: data.amount,
          category_id: data.categoryId,
          note: data.note ?? null,
          lent_on: data.lentOn,
          settled_on: null,
          wallet_debit_tx_id: debitTxId,
          created_at: createdAt,
        }),
      ]);
      toast.success("Lend recorded");
    } catch (error) {
      toast.error("Failed to record lend");
      console.log(error);
    }
  },

  updateLend: async (id, data) => {
    try {
      const lend = get().lends.find((l) => l.id === id);
      if (!lend) return false;

      if (data.amount !== undefined) {
        const paidSoFar = getLendPaidTotal(get().lendPayments, id);
        if (data.amount < paidSoFar) {
          toast.error(`Can't set amount below ₹${paidSoFar} already paid`);
          return false;
        }
      }

      set((s) => ({
        lends: s.lends.map((l) => (l.id === id ? { ...l, ...data } : l)),
        transactions: s.transactions.map((t) =>
          t.id === lend.walletDebitTxId
            ? {
                ...t,
                title: `Lent · ${data.title ?? lend.title}`,
                amount: data.amount ?? lend.amount,
                date: data.lentOn ?? lend.lentOn,
                categoryId: data.categoryId ?? lend.categoryId,
              }
            : t,
        ),
      }));

      await Promise.all([
        supabase
          .from("lends")
          .update({
            ...(data.title !== undefined && { title: data.title }),
            ...(data.amount !== undefined && { amount: data.amount }),
            ...(data.categoryId !== undefined && {
              category_id: data.categoryId,
            }),
            ...(data.note !== undefined && { note: data.note }),
            ...(data.lentOn !== undefined && { lent_on: data.lentOn }),
          })
          .eq("id", id),
        supabase
          .from("transactions")
          .update({
            title: `Lent · ${data.title ?? lend.title}`,
            amount: data.amount ?? lend.amount,
            date: data.lentOn ?? lend.lentOn,
            category_id: data.categoryId ?? lend.categoryId,
          })
          .eq("id", lend.walletDebitTxId),
      ]);

      toast.success("Lend updated");
      return true;
    } catch (error) {
      toast.error("Failed to update lend");
      console.error(error);
      return false;
    }
  },

  addLendPayment: async (lendId, amount, paidOn, userId) => {
    try {
      const lend = get().lends.find((l) => l.id === lendId);
      if (!lend) return;

      if (amount <= 0) {
        toast.error("Enter a valid amount");
        return;
      }

      const paidSoFar = getLendPaidTotal(get().lendPayments, lendId);
      const remaining = Math.round((lend.amount - paidSoFar) * 100) / 100;

      if (amount > remaining) {
        toast.error(`Amount exceeds remaining ₹${remaining}`);
        return;
      }

      const paymentId = nanoid();
      const txId = nanoid();
      const createdAt = new Date().toISOString();
      const newTotal = Math.round((paidSoFar + amount) * 100) / 100;
      const isNowSettled = newTotal >= lend.amount;

      const creditTx: Transaction = {
        id: txId,
        title: `Returned · ${lend.title}`,
        amount,
        type: "transfer",
        categoryId: lend.categoryId,
        date: paidOn,
        createdAt,
      };

      const payment: LendPayment = {
        id: paymentId,
        userId,
        lendId,
        amount,
        paidOn,
        txId,
        createdAt,
      };

      // Optimistic
      set((s) => ({
        transactions: [creditTx, ...s.transactions],
        lendPayments: [payment, ...s.lendPayments],
        lends: s.lends.map((l) =>
          l.id === lendId
            ? { ...l, settledOn: isNowSettled ? paidOn : null }
            : l,
        ),
      }));

      await Promise.all([
        supabase.from("transactions").insert({
          id: txId,
          user_id: userId,
          title: creditTx.title,
          amount,
          type: "transfer",
          category_id: lend.categoryId,
          date: paidOn,
          note: null,
          created_at: createdAt,
        }),
        supabase.from("lend_payments").insert({
          id: paymentId,
          user_id: userId,
          lend_id: lendId,
          amount,
          paid_on: paidOn,
          tx_id: txId,
          created_at: createdAt,
        }),
        supabase
          .from("lends")
          .update({ settled_on: isNowSettled ? paidOn : null })
          .eq("id", lendId),
      ]);

      toast.success(
        isNowSettled
          ? "Fully settled 🎉"
          : `₹${amount} logged · ₹${Math.round((lend.amount - newTotal) * 100) / 100} remaining`,
      );
    } catch (error) {
      toast.error("Failed to log payment");
      console.error(error);
    }
  },

  removeLendPayment: async (paymentId) => {
    try {
      const payment = get().lendPayments.find((p) => p.id === paymentId);
      if (!payment) return;
      const lend = get().lends.find((l) => l.id === payment.lendId);

      // Optimistic
      set((s) => ({
        transactions: s.transactions.filter((t) => t.id !== payment.txId),
        lendPayments: s.lendPayments.filter((p) => p.id !== paymentId),
        lends: s.lends.map((l) =>
          l.id === payment.lendId ? { ...l, settledOn: null } : l,
        ),
      }));

      await Promise.all([
        supabase.from("transactions").delete().eq("id", payment.txId),
        supabase.from("lend_payments").delete().eq("id", paymentId),
        supabase
          .from("lends")
          .update({ settled_on: null })
          .eq("id", payment.lendId),
      ]);

      toast.warning(
        lend ? `Payment removed from "${lend.title}"` : "Payment removed",
      );
    } catch (error) {
      toast.error("Failed to remove payment");
      console.error(error);
    }
  },

  deleteLend: async (lendId) => {
    try {
      const lend = get().lends.find((l) => l.id === lendId);
      if (!lend) return;

      const relatedPayments = get().lendPayments.filter(
        (p) => p.lendId === lendId,
      );
      const txIdsToDelete = [
        lend.walletDebitTxId,
        ...relatedPayments.map((p) => p.txId),
      ];

      set((s) => ({
        lends: s.lends.filter((l) => l.id !== lendId),
        lendPayments: s.lendPayments.filter((p) => p.lendId !== lendId),
        transactions: s.transactions.filter(
          (t) => !txIdsToDelete.includes(t.id),
        ),
      }));

      await Promise.all([
        supabase.from("lends").delete().eq("id", lendId),
        supabase.from("lend_payments").delete().eq("lend_id", lendId),
        ...txIdsToDelete.map((tid) =>
          supabase.from("transactions").delete().eq("id", tid),
        ),
      ]);
      toast.warning("Lend deleted");
    } catch (error) {
      toast.error("Failed to delete lend");
      console.error(error);
    }
  },
}));
