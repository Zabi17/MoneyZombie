# MoneyZombie — Complete Developer README

---

## Table of Contents

1. What Is This App?
2. Tech Stack — What Each Library Does
3. How the App Starts (Boot Flow)
4. Project Folder Structure
5. The Data Layer — Types, Store & Database
6. The Seed Data — What It Is and Why It Matters
7. Custom Hooks — The Logic Layer
8. Pages & Components — What Lives Where
9. Styling System — Colors, Fonts, and CSS Variables
10. Routing — How Navigation Works
11. Key Patterns To Understand
12. Things You Must NEVER Break
13. Common Changes — Where To Make Them
14. How To Make This Scalable
15. Current Bugs & Issues To Watch
16. Next Steps

---

## 1. What Is This App?

MoneyZombie is a **mobile-first personal finance tracker** built with React and TypeScript. It lets you:

- Log income and expense transactions
- Organize them by category
- Set monthly spending budgets
- View charts and reports across different time ranges
- Export your data as CSV

The app currently stores all data in **Supabase** (a cloud database), but it also contains a `lib/storage.ts` file from a previous localStorage-based design. The live app reads and writes from Supabase on every action.

The UI is designed primarily for mobile phones. Desktop works fine, but every decision — spacing, navigation, form layout — was made with a small screen in mind first.

---

## 2. Tech Stack — What Each Library Does

| Library | What It Does In This App |
|---|---|
| **React 19** | The UI framework. Everything you see is a React component. |
| **TypeScript** | Adds types to JavaScript. Prevents many bugs at compile time. |
| **Vite** | The dev server and build tool. Runs `npm run dev`. Very fast. |
| **Tailwind v4** | Utility CSS classes like `flex`, `gap-2`, `rounded-xl`. Used for layout and spacing. |
| **Zustand** | Global state management. Holds all your app data in memory while the app is open. |
| **Supabase** | Cloud PostgreSQL database. All data persists here. |
| **react-router-dom v7** | Handles page navigation (Dashboard, Transactions, Budgets, etc.). |
| **Recharts** | The charting library. Powers bar charts, line charts, and pie charts in Reports. |
| **shadcn/ui + radix-ui** | Pre-built accessible UI components — Sheet (bottom drawer), Dialog, Select, etc. |
| **vaul** | Drawer component used for mobile-friendly bottom sheets. |
| **date-fns** | Date utilities — formatting dates, subtracting months, comparing dates. |
| **nanoid** | Generates short random IDs (like `V1StGXR8_Z5jdHi6B-myT`) for new records. |
| **lucide-react** | Icon library. All icons in the app come from here (e.g. `Wallet`, `TrendingUp`). |
| **clsx + tailwind-merge** | Utilities for combining CSS class names safely without conflicts. |

---

## 3. How the App Starts (Boot Flow)

Understanding this flow is critical. Here is exactly what happens when someone opens the app:

```
Browser loads index.html
  → loads src/main.tsx
    → renders <App />
      → App calls loadAll() from Zustand store
        → fetches transactions, categories, budgets, settings from Supabase
          → if successful: sets loadState = "ready"
          → if failed: shows "Connection failed" error screen
      → if settings.name is empty: shows <Welcome /> onboarding screen
      → if name exists: shows <BrowserRouter> with all pages
```

**The Welcome screen** is a 2-step onboarding flow. Step 1 asks for your name. Step 2 asks for your preferred currency. Once you click "Get started", it calls `updateSettings()` which saves name and currency to Supabase. On the next render, `name` is no longer empty, so the main app appears.

**If you are offline or Supabase is down**, the app shows a "Connection failed" screen with a Retry button. There is no offline fallback currently.

---

## 4. Project Folder Structure

```
src/
├── main.tsx                 ← Entry point. Renders <App /> into the DOM.
├── App.tsx                  ← Root component. Handles loading, onboarding, routing.
├── index.css                ← Global styles, custom CSS variables, fonts, scrollbar.
├── App.css                  ← Minimal, mostly unused.
│
├── types/
│   └── index.ts             ← All TypeScript types: Transaction, Category, Budget, AppSettings.
│
├── constants/
│   └── defaults.ts          ← Default categories (seed data), default settings, currency list.
│
├── store/
│   └── useAppStore.ts       ← Zustand store. THE source of truth. All CRUD operations live here.
│
├── lib/
│   ├── supabase.ts          ← Initializes the Supabase client using env vars.
│   ├── storage.ts           ← OLD localStorage helpers. Not used by the store anymore.
│   └── utils.ts             ← The `cn()` helper for combining class names.
│
├── hooks/
│   ├── useTransactions.ts   ← Filtering/aggregating transactions by month/scope.
│   ├── useBudgets.ts        ← Budget vs actual spending per month.
│   ├── useCurrency.ts       ← Reads current currency and formats numbers.
│   └── useReports.ts        ← Multi-month analytics for the Reports page.
│
├── pages/
│   ├── Dashboard.tsx        ← Home screen with stats, charts, recent transactions.
│   ├── Transactions.tsx     ← Full transaction list with search and filters.
│   ├── Budgets.tsx          ← Monthly budget management.
│   ├── Categories.tsx       ← Custom category creation and management.
│   ├── Reports.tsx          ← Charts and analytics over time ranges.
│   ├── Settings.tsx         ← User preferences (name, theme, currency, danger zone).
│   └── NotFound.tsx         ← 404 page for unknown routes.
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx    ← Wraps every page. Contains Sidebar + TopBar + BottomNav.
│   │   ├── BottomNav.tsx    ← The floating pill navigation bar at the bottom (mobile).
│   │   ├── Sidebar.tsx      ← Left sidebar (visible on large screens only).
│   │   └── TopBar.tsx       ← Top bar (visible on mobile only, shows page title).
│   │
│   ├── onboarding/
│   │   └── Welcome.tsx      ← The 2-step first-run screen.
│   │
│   ├── dashboard/
│   │   ├── MonthSelector.tsx      ← The ← April 2025 → month picker.
│   │   ├── ScopeSelector.tsx      ← The "This month / + Prev / All time" dropdown chip.
│   │   ├── StatCard.tsx           ← (Actually in components/ui/) — each stat box.
│   │   ├── SpendingPieChart.tsx   ← Donut chart of expense categories.
│   │   ├── CategoryBreakdown.tsx  ← Accordion list of top spending categories.
│   │   └── RecentTransactions.tsx ← Last few transactions shown on Dashboard.
│   │
│   ├── transactions/
│   │   ├── TransactionForm.tsx  ← Add/Edit form as a bottom sheet.
│   │   ├── TransactionItem.tsx  ← One row in the transactions list.
│   │   ├── FilterBar.tsx        ← Search + type + category filters.
│   │   └── DeleteDialog.tsx     ← Confirmation dialog before deleting.
│   │
│   ├── budgets/
│   │   ├── BudgetCard.tsx       ← One budget row with progress bar.
│   │   ├── BudgetForm.tsx       ← Add/edit budget as a bottom sheet.
│   │   └── BudgetSummaryBar.tsx ← Total budget vs total spent bar.
│   │
│   ├── categories/
│   │   ├── CategoryCard.tsx     ← One category card with edit/delete.
│   │   ├── CategoryForm.tsx     ← Add/edit category form.
│   │   ├── ColorPicker.tsx      ← Color swatches for choosing category color.
│   │   └── IconPicker.tsx       ← Grid of Lucide icons to pick from.
│   │
│   ├── reports/
│   │   ├── MonthlyBarChart.tsx      ← Grouped bar chart (income vs expense per month).
│   │   ├── NetLineChart.tsx         ← Line chart of net savings over time.
│   │   ├── AllTimeCategoryList.tsx  ← Ranked list of all-time spending by category.
│   │   ├── StatHighlight.tsx        ← A single highlighted stat (biggest expense, etc.).
│   │   └── ExportButton.tsx         ← Downloads all transactions as a CSV file.
│   │
│   ├── settings/
│   │   ├── SettingRow.tsx       ← One row: label + description + control on the right.
│   │   ├── SettingSection.tsx   ← A section card that groups multiple SettingRows.
│   │   ├── ThemeToggle.tsx      ← Light / Dark / System toggle buttons.
│   │   ├── CurrencySelect.tsx   ← Currency dropdown.
│   │   ├── AppStats.tsx         ← Shows counts of transactions, categories, budgets.
│   │   └── DangerZone.tsx       ← "Clear all data" button with confirmation.
│   │
│   └── ui/
│       ├── StatCard.tsx         ← Reusable card for a single number stat.
│       ├── alert-dialog.tsx     ← shadcn AlertDialog (used in DeleteDialog).
│       ├── badge.tsx            ← Small colored label component.
│       ├── button.tsx           ← shadcn Button.
│       ├── calendar.tsx         ← Date picker calendar (shadcn).
│       ├── card.tsx             ← shadcn Card.
│       ├── dialog.tsx           ← shadcn Dialog (modal).
│       ├── drawer.tsx           ← vaul Drawer (bottom sheet).
│       ├── input.tsx            ← shadcn Input.
│       ├── label.tsx            ← shadcn Label.
│       ├── popover.tsx          ← shadcn Popover.
│       ├── progress.tsx         ← shadcn Progress bar.
│       ├── select.tsx           ← shadcn Select dropdown.
│       ├── sheet.tsx            ← shadcn Sheet (side/bottom panel — used for forms).
│       └── tabs.tsx             ← shadcn Tabs.
```

---

## 5. The Data Layer — Types, Store & Database

### Types (`src/types/index.ts`)

These are the four shapes of data the app understands:

```typescript
// A money movement — income or expense
Transaction {
  id: string           // Unique ID generated by nanoid
  title: string        // e.g. "Groceries", "Salary"
  amount: number       // Always positive (e.g. 500)
  type: "expense" | "income"
  categoryId: string   // Links to a Category.id
  date: string         // "2025-04-15" (YYYY-MM-DD)
  note?: string        // Optional extra description
  createdAt: string    // ISO timestamp of when it was created
}

// A way to group transactions
Category {
  id: string           // e.g. "food", "salary", or a nanoid for custom ones
  name: string         // e.g. "Food & Dining"
  icon: string         // Name of a Lucide icon e.g. "UtensilsCrossed"
  color: string        // Hex color e.g. "#f97316"
  type: "expense" | "income"
}

// A spending limit for a category in a specific month
Budget {
  id: string
  categoryId: string   // Which category this budget is for
  amount: number       // The limit e.g. 5000
  month: string        // "2025-04" (YYYY-MM format)
}

// User preferences
AppSettings {
  currency: string     // "INR", "USD", "EUR", etc.
  name: string         // The user's name
  theme: "light" | "dark" | "system"
}
```

### Zustand Store (`src/store/useAppStore.ts`)

The store is the **brain of the app**. It holds all data in memory and exposes functions to modify it. Every component that needs data reads from here.

The pattern for every write operation is:

1. **Optimistic update** — immediately update the in-memory state so the UI feels instant
2. **Supabase write** — then send the change to the database in the background

Example flow when you add a transaction:
```
User clicks "Add Transaction"
  → addTransaction() is called
    → nanoid() creates a new ID
    → State is updated immediately (UI shows the transaction instantly)
    → supabase.from("transactions").insert(...) runs in the background
```

**Why optimistic updates?** Because waiting for the network response every time would make the app feel slow. The tradeoff is that if the Supabase write fails, the UI shows data that isn't actually saved. There is currently no error rollback.

### Supabase Database

The app uses four tables:

| Table | Columns |
|---|---|
| `transactions` | id, title, amount, type, category_id, date, note, created_at |
| `categories` | id, name, icon, color, type |
| `budgets` | id, category_id, amount, month |
| `settings` | id (always 1), currency, name, theme |

**Important**: Column names in Supabase use `snake_case` (e.g. `category_id`), but the app uses `camelCase` (e.g. `categoryId`). The `loadAll()` function manually maps between them.

---

## 6. The Seed Data — What It Is and Why It Matters

The seed data lives in `src/constants/defaults.ts`. It defines the **12 starting categories** that every new user gets.

```typescript
// Example seed category
{
  id: "food",           // ← HARDCODED string ID, not a nanoid
  name: "Food & Dining",
  icon: "UtensilsCrossed",
  color: "#f97316",
  type: "expense",
}
```

**Why the IDs matter**: The seed categories use simple string IDs like `"food"`, `"transport"`, `"salary"`. These IDs are used in budgets and transactions (`categoryId: "food"`). If you ever delete a seed category from the database and re-insert it with a different ID, all transactions that referenced the old ID will be orphaned — they'll have a `categoryId` that no longer exists, and they won't show up in charts.

**When does seeding happen?**: In `loadAll()`, if the `categories` table comes back empty from Supabase, the app inserts all `DEFAULT_CATEGORIES` into the database. This is a one-time operation per new Supabase project.

**What to be careful about**:
- Do NOT change the `id` values of existing default categories.
- Do NOT manually delete categories from the DB that have linked transactions.
- If you want to add more default categories, add them to the `DEFAULT_CATEGORIES` array, but also manually insert them into the DB if your project is already seeded (or clear the categories table to trigger re-seeding).

---

## 7. Custom Hooks — The Logic Layer

Hooks are functions that start with `use`. They do calculations and return results — components just display the results. This is where the filtering math lives.

### `useTransactions(month?)` — Single month filter

```typescript
const { filtered, totalExpense, totalIncome, balance } = useTransactions("2025-04");
```

Filters all transactions to just the given month. Returns totals. Used in some parts of the app for simple month-scoped data.

### `useTransactionsMulti(months?)` — Multi-month filter

```typescript
const { filtered, totalExpense } = useTransactionsMulti(["2025-03", "2025-04"]);
// or: useTransactionsMulti(undefined)  → all time
```

This is what the **Dashboard** uses. Pass `undefined` to get all-time data. Pass an array of month strings to get just those months. The `getScopeMonths()` function (also in `useTransactions.ts`) converts a `ViewScope` + anchor month into this array.

### `useRunningBalance(upToMonth)` — Cumulative balance

```typescript
const runningBalance = useRunningBalance("2025-04");
```

Returns the total balance from ALL transactions ever recorded up to and including the given month. This is different from "this month's net" — it carries forward history. If you had ₹10,000 last month and spent ₹3,000 this month, the running balance is ₹7,000 regardless of what month you're viewing.

### `useBudgets(month)` — Budget vs actual

```typescript
const budgets = useBudgets("2025-04");
// Each item has: ...budget, spent, percent, isOver, category
```

For each budget set in the given month, calculates how much was actually spent in that category. Returns `isOver: true` if spending exceeded the budget.

### `useCurrency()` — Format money

```typescript
const { symbol, format } = useCurrency();
format(5000) // → "₹5,000" (or "$5,000" depending on settings)
```

Reads the current currency from settings and returns the symbol and a formatting function.

### `useReports(monthsBack)` — Analytics data

```typescript
const { monthly, categoryTotals, avgMonthly, savingsRate } = useReports(6);
```

Builds a summary of the last N months. Returns monthly income/expense arrays for charts, category totals for rankings, and computed stats like savings rate.

---

## 8. Pages & Components — What Lives Where

### Dashboard (`pages/Dashboard.tsx`)

The home screen. Contains:
- A greeting with the user's name and time of day
- `MonthSelector` — navigate months with ← →
- `ScopeSelector` — a dropdown chip to change the data window (This month / + Prev month / All time)
- 3 `StatCard` components — Running Balance, Income, Expenses
- `SpendingPieChart` — donut chart of expenses by category
- `CategoryBreakdown` — accordion list (tap a category to see its individual transactions)
- `RecentTransactions` — last few transactions for the current scope
- Two quick-add buttons (+ Add income, − Add expense) that open `TransactionForm`

**State management in Dashboard**: The `activeDate` (which month you're viewing) and `scope` (this month / prev / all) are local state. They're not global — they're only needed on Dashboard.

### Transactions (`pages/Transactions.tsx`)

Full list of all transactions with:
- Search bar (by title)
- Filter by type (all / income / expense)
- Filter by category
- Transactions grouped by date ("Today", "Yesterday", "April 15"...)
- Tap any row to edit, long-press or swipe... (actually there are Edit and Delete icon buttons on each row via `TransactionItem`)

### Budgets (`pages/Budgets.tsx`)

Per-month budgets. Uses `useBudgets(month)` to get budgets enriched with spending data. Shows a warning banner if any budget is exceeded. The `BudgetSummaryBar` shows the overall total spent vs total budgeted.

### Categories (`pages/Categories.tsx`)

Create, edit, and delete categories. Each category has a name, type (income/expense), color (from `ColorPicker`), and icon (from `IconPicker`). The icon picker shows a grid of Lucide icons by name — it uses `import * as Icons from "lucide-react"` to look them up dynamically.

### Reports (`pages/Reports.tsx`)

Analytics with a 3M / 6M / 12M range selector:
- `MonthlyBarChart` — income vs expense bars per month
- `NetLineChart` — net savings over time
- `StatHighlight` boxes — biggest expense, avg monthly, savings rate
- `AllTimeCategoryList` — ranked all-time spending by category
- `ExportButton` — downloads a CSV of all transactions

### Settings (`pages/Settings.tsx`)

- Edit your name
- Switch theme (Light / Dark / System)
- Change currency
- View data summary (how many transactions, etc.)
- Danger Zone: wipe all data

---

## 9. Styling System — Colors, Fonts, and CSS Variables

All colors and fonts are defined **once** in `src/index.css` using the `@theme` block (Tailwind v4 syntax). Never hardcode colors directly — always use the CSS variables.

### Color Variables

```css
--color-background    /* Darkest. The page background. */
--color-surface       /* Slightly lighter. Cards, panels. */
--color-surface-2     /* Even lighter. Input backgrounds, nested cards. */
--color-border        /* Subtle border color. */

--color-accent        /* The brand green. Used for CTAs, active states. */
--color-accent-dim    /* Slightly darker green for hover states. */

--color-income        /* Green. Used for income amounts. */
--color-expense       /* Red-orange. Used for expense amounts. */
--color-warning       /* Yellow. Alerts and warnings. */
--color-dash          /* Blue-teal. Running balance accent. */

--color-text-primary    /* Main text. Near white. */
--color-text-secondary  /* Slightly dimmer text. */
--color-text-muted      /* Quiet labels, timestamps. */
```

### Fonts

```css
--font-display: 'Syne', sans-serif;   /* Headings, page titles, buttons */
--font-sans: 'DM Sans', sans-serif;   /* Body text, inputs, all regular copy */
```

### Rules for Styling

- Use `style={{ color: "var(--color-text-muted)" }}` for inline color overrides.
- Use Tailwind utility classes for layout: `flex`, `gap-2`, `rounded-xl`, `p-4`, `grid`, etc.
- **Do NOT add separate CSS files** for components. All styling goes through Tailwind classes + inline CSS vars.
- **Do NOT use v3 Tailwind syntax** like `bg-[color-background]` with bracket notation for custom colors — use inline styles with CSS variables instead, since Tailwind v4 doesn't generate classes for custom color tokens by default.
- For opacity variants on colors (like a transparent accent background), the shorthand `var(--color-accent)15` is being used — this appends a hex opacity to the color. It works but only with 6-digit hex colors, not oklch. Since the color vars are oklch in this project, be careful — `${cat.color}25` works because `cat.color` is a hex value (`#f97316`), not a CSS variable.

---

## 10. Routing — How Navigation Works

The router is set up in `App.tsx`. All main pages are children of `AppLayout`, which provides the persistent navigation chrome (sidebar, top bar, bottom nav). `NotFound` is outside `AppLayout` so it's full screen.

```
/                → Dashboard
/transactions    → Transactions
/budgets         → Budgets
/categories      → Categories
/reports         → Reports
/settings        → Settings
/* (anything)    → NotFound (404)
```

The `vercel.json` file contains a rewrite rule that redirects all requests to `index.html`. This is required for React Router to work on Vercel — without it, navigating directly to `/transactions` would return a 404 from the server.

Navigation on mobile uses `BottomNav` (the floating pill). On desktop (lg screens and above), `Sidebar` appears on the left and `BottomNav` is hidden.

---

## 11. Key Patterns To Understand

### Optimistic Updates

When you add, edit, or delete something, the store updates the local state immediately before waiting for Supabase to confirm. This makes the UI feel instant. But there's a risk: if the network call fails silently, your UI will show data that wasn't actually saved.

### `months` as `string[] | undefined`

The app uses month strings in `"YYYY-MM"` format throughout. The value `undefined` consistently means "all time, no filter". Never use an empty array `[]` where you mean "all time" — an empty array would filter to zero results.

### Lucide Icons as Strings

Categories store the icon as a string name: `"UtensilsCrossed"`. At render time, the app does:

```typescript
import * as Icons from "lucide-react";
const IconComp = (Icons as any)[cat.icon] ?? Icons.CircleDot;
```

This is a dynamic lookup. If someone stores an invalid icon name, it falls back to `CircleDot`. When building the icon picker, only include valid Lucide icon names.

### `cn()` Utility

The `cn(...classes)` function combines Tailwind class strings without conflicts. It uses `clsx` for conditional classes and `tailwind-merge` to resolve duplicates. Use it whenever you're conditionally applying Tailwind classes:

```typescript
className={cn("rounded-xl p-4", isActive && "bg-accent", className)}
```

---

## 12. Things You Must NEVER Break

These are the things that, if changed incorrectly, will cause silent or hard-to-debug failures:

1. **The default category IDs** — `"food"`, `"transport"`, `"salary"`, etc. in `constants/defaults.ts`. If you rename or remove these IDs, any existing transaction using them becomes an orphan with no category.

2. **The `date` field format** — Transactions store dates as `"YYYY-MM-DD"` strings. The filtering logic (`t.date.startsWith(month)`) depends on this. If any date is stored differently (e.g., as a full ISO string with time), filtering will silently break.

3. **The `month` field format on budgets** — Budgets use `"YYYY-MM"`. If this changes, budget lookup will fail.

4. **The `settings` row with `id = 1`** — The app always reads settings as `.eq("id", 1).single()`. There must be exactly one row with id=1 in the settings table. If you clear the table without re-inserting a row with id=1, settings will fail to load.

5. **The `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars** — `lib/supabase.ts` throws an error if these are missing. If you deploy without them, the app crashes on load.

6. **The `snake_case ↔ camelCase` mapping in `loadAll()`** — The DB uses `category_id`, `created_at`. The app uses `categoryId`, `createdAt`. The mapping in `loadAll()` must stay in sync with both the DB schema and the TypeScript types.

7. **Tailwind v4 syntax** — This project is on Tailwind v4, not v3. Classes like `text-2xl`, `rounded-xl` are the same, but custom token syntax, config structure, and plugin API are different. Do not paste v3-style tailwind config patterns.

---

## 13. Common Changes — Where To Make Them

**Add a new currency**
→ `src/constants/defaults.ts` — add an entry to the `CURRENCIES` array.

**Add a new default category**
→ `src/constants/defaults.ts` — add to `DEFAULT_CATEGORIES`. Also insert it manually in your Supabase `categories` table if the app is already deployed.

**Change the app's color scheme**
→ `src/index.css` — edit the `@theme` block. The oklch values control hue, chroma, and lightness. Just changing a few hex values there propagates everywhere.

**Add a new field to Transaction (e.g. "receipt image")**
→ 4 places:
1. `src/types/index.ts` — add the field to the `Transaction` type
2. `src/store/useAppStore.ts` — update `addTransaction`, `updateTransaction`, and the mapping in `loadAll()`
3. `src/components/transactions/TransactionForm.tsx` — add the field to the form
4. Supabase — add the column to the `transactions` table

**Add a new page**
→ 3 places:
1. Create `src/pages/YourPage.tsx`
2. Add a `<Route>` in `App.tsx`
3. Add a nav item in `components/layout/BottomNav.tsx` and `components/layout/Sidebar.tsx`

**Change how currency is formatted**
→ `src/hooks/useCurrency.ts` — modify the `Intl.NumberFormat` call.

**Change the Reports time window options**
→ `src/pages/Reports.tsx` — modify the `RANGE_OPTIONS` array.

---

## 14. How To Make This Scalable

The current architecture is good for a single-user app, but here's what to do as it grows:

### Add Multi-User Auth (Most Important)

Right now, **all users share the same database rows**. There is no user authentication and no Row Level Security (RLS) on Supabase. Anyone with the anon key can see everyone's data.

To fix this:
1. Enable Supabase Auth (email/password, Google, etc.)
2. Add a `user_id` column to `transactions`, `categories`, `budgets`, and `settings`
3. Enable RLS on all tables and write policies like: `user_id = auth.uid()`
4. Modify `loadAll()` to filter by the logged-in user, and all write operations to include `user_id`

### Handle Failed Supabase Writes

Currently, if Supabase fails after an optimistic update, the UI shows stale data. To fix:
- In each write function, catch the error after the `await supabase...` call
- Roll back the state change: `set(previousState)`
- Show a toast notification to the user

### Add Loading States Per Operation

Right now there's only one global `loadState`. A better approach: each action (adding, deleting) should have its own loading indicator so the user knows something is happening.

### Pagination for Large Transaction Lists

The current `loadAll()` fetches ALL transactions at once. With thousands of transactions, this becomes slow and wastes memory. Switch to paginated queries: only load the current month by default, load more on scroll.

### Split the Store

`useAppStore.ts` currently handles everything. As the app grows, consider splitting it:
- `useTransactionStore.ts`
- `useCategoryStore.ts`
- `useBudgetStore.ts`
- `useSettingsStore.ts`

Each slice can be composed back together using Zustand's `create` with slices pattern.

### Add Error Boundaries

React error boundaries prevent the entire app from crashing if one component throws. Wrap major sections (`<Dashboard>`, `<Reports>`) with an `ErrorBoundary` component.

---

## 15. Current Bugs & Issues To Watch

**The `.env` file is committed to git**
The `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values are in the `.env` file which is included in the repository. The anon key has limited permissions (anonymous only), but it's still a security practice violation. For production, add `.env` to `.gitignore` and set the variables as environment variables on your deployment platform (Vercel, etc.).

**No auth, no data isolation**
As mentioned: all users of this app share the same Supabase database. Do not share this app's URL publicly without first adding authentication.

**Optimistic updates have no rollback**
If a Supabase write fails silently (no network, quota hit, etc.), the UI will show data that isn't actually in the database. On next `loadAll()`, the data will disappear.

**`lib/storage.ts` is dead code**
The file exists and defines localStorage helpers, but nothing uses it anymore — the store now uses Supabase directly. This can be deleted, but it's harmless. Do not use it or hook it back up without also removing the Supabase calls from the store.

**The footer text says "All data stored locally"**
In `Settings.tsx`, there's a footer that reads "All data stored locally on your device." This is no longer true — data is in Supabase. This is a leftover from the localStorage era and should be updated.

**`colorScheme: "dark"` hardcoded on date input**
In `TransactionForm.tsx`, the date input has `colorScheme: "dark"` hardcoded inline. When/if a light theme is added, this date picker won't change with it. It should read from the current theme setting.

**`nanoid` IDs mixed with hardcoded IDs**
Default categories use hardcoded string IDs (`"food"`, `"salary"`). Custom categories created by users get `nanoid()` IDs. This inconsistency is fine functionally, but something to be aware of when writing queries or seeds.

---

## 16. Next Steps (Suggested Roadmap)

Here's a prioritized list of what to build next, roughly in order of importance:

1. **User Authentication + RLS** — Make the app actually secure and multi-user. Use Supabase Auth.
2. **Rollback on failed writes** — Make the optimistic updates safe with proper error handling.
3. **Recurring transactions** — Let users mark transactions as recurring (monthly salary, rent).
4. **Push notifications / budget alerts** — Notify the user when they approach a budget limit.
5. **Dark/Light theme toggle that actually works** — The theme setting exists but the CSS is currently dark-only. Wire up light mode styles.
6. **Transaction attachments** — Allow uploading a photo of a receipt linked to a transaction.
7. **Tags / split transactions** — Let a single transaction span multiple categories.
8. **Import from bank statement** — Parse CSV exports from banks and auto-categorize.
9. **Widgets / home screen shortcuts** — On mobile, quick-add buttons via PWA features.
10. **PWA offline support** — Cache the app shell and allow viewing (read-only) recent data without internet.

---

*MoneyZombie is built with a clear philosophy: mobile-first, fast, and visually polished. Before adding any new UI, open the app on your phone and ask — does this feel good on a 6-inch screen? If not, redesign before coding.*

*follow me on [Linkedin](https://www.linkedin.com/in/zabiahmed3717/) ,[Portfolio](https://zabi17.github.io/portfolio/)*