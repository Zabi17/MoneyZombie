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
};

export const useAppStore = create<AppStore>()((set, get) => ({
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  settings: DEFAULT_SETTINGS,
  loadState: "idle",

  reset: () =>
    set({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      budgets: [],
      settings: DEFAULT_SETTINGS,
      loadState: "idle",
    }),

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  loadAll: async (userId: string) => {
    set({ loadState: "loading" });
    try {
      const [txRes, catRes, budRes, setRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false }),
        supabase.from("categories").select("*").eq("user_id", userId),
        supabase.from("budgets").select("*").eq("user_id", userId),
        supabase.from("settings").select("*").eq("user_id", userId).single(),
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

      // If no categories yet, seed defaults for this user
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

      // In loadAll, change the seed insert to use the original id, not a modified one
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

      // If no settings row yet, create one for this user
      if (!setRes.data) {
        await supabase.from("settings").insert({
          user_id: userId,
          currency: DEFAULT_SETTINGS.currency,
          name: DEFAULT_SETTINGS.name,
          theme: DEFAULT_SETTINGS.theme,
        });
      }

      set({ transactions, categories, budgets, settings, loadState: "ready" });
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
    await supabase.from("categories").upsert(
      DEFAULT_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        type: c.type,
        user_id: userId,
      })),
      { onConflict: "user_id, name", ignoreDuplicates: true },
    );
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
}));
