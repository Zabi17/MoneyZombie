export type SavingsPotType = "goal" | "recurring" | "emergency";
export type SavingsTransactionType = "deposit" | "withdrawal" | "transfer";
export type TransactionType = "income" | "expense" | "transfer";

export type SavingsPot = {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: SavingsPotType;
  currentAmount: number;
  isCompleted: boolean;
  createdAt: string;

  // goal only
  targetAmount?: number;
  deadline?: string;

  // recurring only
  recurringAmount?: number;

  // emergency only
  isLocked?: boolean;
  floorAmount?: number;
};

export type SavingsTransaction = {
  id: string;
  userId: string;
  type: SavingsTransactionType;
  amount: number;
  fromPotId: string | null; // null = main wallet
  toPotId: string | null; // null = main wallet
  note?: string;
  createdAt: string;
};

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
