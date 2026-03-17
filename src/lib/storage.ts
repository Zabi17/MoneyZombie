const KEYS = {
  TRANSACTIONS: "xpns_transactions",
  CATEGORIES: "xpns_categories",
  BUDGETS: "xpns_budgets",
  SETTINGS: "xpns_settings",
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
