const KEYS = {
  TRANSACTIONS: "MoneyZombie_transactions",
  CATEGORIES: "MoneyZombie_categories",
  BUDGETS: "MoneyZombie_budgets",
  SETTINGS: "MoneyZombie_settings",
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage write failed:", e);
  }
}

export const storage = { get, set, KEYS };
