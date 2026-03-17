import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { Transaction, Category, Budget, AppSettings } from "../types";
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "../constants/defaults";

type AppStore = {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  settings: AppSettings;

  // Transactions
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Categories
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Budgets
  setBudget: (b: Omit<Budget, "id">) => void;
  deleteBudget: (id: string) => void;

  // Settings
  updateSettings: (s: Partial<AppSettings>) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      budgets: [],
      settings: DEFAULT_SETTINGS,

      addTransaction: (t) =>
        set((s) => ({
          transactions: [
            { ...t, id: nanoid(), createdAt: new Date().toISOString() },
            ...s.transactions,
          ],
        })),

      updateTransaction: (id, t) =>
        set((s) => ({
          transactions: s.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...t } : tx,
          ),
        })),

      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.filter((tx) => tx.id !== id),
        })),

      addCategory: (c) =>
        set((s) => ({
          categories: [...s.categories, { ...c, id: nanoid() }],
        })),

      updateCategory: (id, c) =>
        set((s) => ({
          categories: s.categories.map((cat) =>
            cat.id === id ? { ...cat, ...c } : cat,
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((cat) => cat.id !== id),
        })),

      setBudget: (b) =>
        set((s) => {
          const existing = s.budgets.find(
            (x) => x.categoryId === b.categoryId && x.month === b.month,
          );
          if (existing) {
            return {
              budgets: s.budgets.map((x) =>
                x.id === existing.id ? { ...x, amount: b.amount } : x,
              ),
            };
          }
          return { budgets: [...s.budgets, { ...b, id: nanoid() }] };
        }),

      deleteBudget: (id) =>
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),
    }),
    {
      name: "MoneyZombie-store", // single localStorage key via zustand/persist
    },
  ),
);
