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
  targetAmount?: number;
  deadline?: string;
  recurringAmount?: number;
  isLocked?: boolean;
  floorAmount?: number;
};

export type SavingsTransaction = {
  id: string;
  userId: string;
  type: SavingsTransactionType;
  amount: number;
  fromPotId: string | null;
  toPotId: string | null;
  note?: string;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
};

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  note?: string;
  createdAt: string;
};

export type Lend = {
  id: string;
  userId: string;
  title: string;
  amount: number;
  categoryId: string;
  note?: string;
  lentOn: string; // date string "yyyy-MM-dd"
  settledOn?: string | null;
  walletDebitTxId: string;
  walletCreditTxId?: string | null;
  createdAt: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  month: string;
};

export type AppSettings = {
  currency: string;
  name: string;
  theme: "light" | "dark" | "system";
};
