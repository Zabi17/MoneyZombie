import { create } from "zustand";
import { nanoid } from "nanoid";
import { Transaction, Category, Budget, AppSettings } from "../types";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "../constants/defaults";
import { supabase } from "../lib/supabase";

type LoadState = "idle" | "loading" | "ready" | "error";

type AppStore = {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  settings: AppSettings;
  loadState: LoadState;

  // Bootstrap — call once on app mount
  loadAll: () => Promise<void>;

  // Transactions
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Categories
  addCategory: (c: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, c: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Budgets
  setBudget: (b: Omit<Budget, "id">) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Settings
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
};

export const useAppStore = create<AppStore>()((set, get) => ({
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  settings: DEFAULT_SETTINGS,
  loadState: "idle",

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  loadAll: async () => {
    set({ loadState: "loading" });
    try {
      const [txRes, catRes, budRes, setRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: false }),
        supabase.from("categories").select("*"),
        supabase.from("budgets").select("*"),
        supabase.from("settings").select("*").eq("id", 1).single(),
      ]);

      // Map snake_case DB columns → camelCase app types
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

      // If no categories in DB yet, seed them
      if ((catRes.data ?? []).length === 0) {
        await supabase.from("categories").insert(
          DEFAULT_CATEGORIES.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            type: c.type,
          })),
        );
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

      set({ transactions, categories, budgets, settings, loadState: "ready" });
    } catch (e) {
      console.error("loadAll failed", e);
      set({ loadState: "error" });
    }
  },

  // ── Transactions ───────────────────────────────────────────────────────────
  addTransaction: async (t) => {
    const id = nanoid();
    const createdAt = new Date().toISOString();
    // Optimistic update
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
  addCategory: async (c) => {
    const id = nanoid();
    set((s) => ({ categories: [...s.categories, { ...c, id }] }));
    await supabase.from("categories").insert({
      id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type,
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
  setBudget: async (b) => {
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
      });
    }
  },

  deleteBudget: async (id) => {
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
    await supabase.from("budgets").delete().eq("id", id);
  },

  // ── Settings ───────────────────────────────────────────────────────────────
  updateSettings: async (s) => {
    set((state) => ({ settings: { ...state.settings, ...s } }));
    await supabase
      .from("settings")
      .update({
        ...(s.currency !== undefined && { currency: s.currency }),
        ...(s.name !== undefined && { name: s.name }),
        ...(s.theme !== undefined && { theme: s.theme }),
      })
      .eq("id", 1);
  },
}));
