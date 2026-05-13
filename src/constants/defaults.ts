import { Category, AppSettings, TransactionType } from "../types";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food & Dining",
    icon: "UtensilsCrossed",
    color: "#f97316",
    type: "expense",
  },
  {
    id: "transport",
    name: "Transport",
    icon: "Car",
    color: "#3b82f6",
    type: "expense",
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "ShoppingBag",
    color: "#ec4899",
    type: "expense",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "Tv",
    color: "#8b5cf6",
    type: "expense",
  },
  {
    id: "health",
    name: "Health",
    icon: "HeartPulse",
    color: "#ef4444",
    type: "expense",
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: "Zap",
    color: "#eab308",
    type: "expense",
  },
  {
    id: "rent",
    name: "Rent & Housing",
    icon: "Home",
    color: "#14b8a6",
    type: "expense",
  },
  {
    id: "personal",
    name: "Personal",
    icon: "User",
    color: "#06b6d4",
    type: "expense",
  },
  {
    id: "salary",
    name: "Salary",
    icon: "Wallet",
    color: "#22c55e",
    type: "income",
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: "Laptop",
    color: "#10b981",
    type: "income",
  },
  {
    id: "investment",
    name: "Investment",
    icon: "TrendingUp",
    color: "#6366f1",
    type: "income",
  },
  {
    id: "savings",
    name: "Savings",
    icon: "Landmark",
    color: "#4ade80",
    type: "transfer" as TransactionType,
  },
  {
    id: "other",
    name: "Other",
    icon: "CircleDot",
    color: "#6b7280",
    type: "expense",
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  currency: "INR",
  name: "",
  theme: "system",
};

export const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
];
