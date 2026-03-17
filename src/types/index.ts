export type TransactionType = "expense" | "income";

export type Category = {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string; // hex or tailwind color token
  type: TransactionType;
};

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // ISO string
  note?: string;
  createdAt: string; // ISO string
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // "YYYY-MM"
};

export type AppSettings = {
  currency: string; // "USD", "INR", "EUR" etc
  name: string; // user's name
  theme: "light" | "dark" | "system";
};
