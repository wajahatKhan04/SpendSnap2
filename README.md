# SpendSnap

Smart Shopping. Smarter Budgeting.

A premium personal finance and grocery management platform — plan monthly
shopping, track planned vs. actual spending, and see exactly where the money
goes.

## Status: all four phases built

- ✅ **Phase 1** — project setup, Firebase config, Google auth, protected routes, dashboard
- ✅ **Phase 2** — shopping list CRUD, item management, real-time totals, price-change tracking, copy-previous-month, duplicate/archive/delete
- ✅ **Phase 3** — analytics (monthly/yearly/category charts), price history trend view, PDF/CSV/Excel export, settings
- ✅ **Phase 4** — offline persistence, dark mode, Framer Motion transitions, accessibility passes, lazy-loaded export libs, clean production build

**Zero TypeScript errors · zero ESLint warnings · production build succeeds.**

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Firebase project's config
npm run dev
```

Open http://localhost:3000. The UI renders fine with no Firebase project
connected (you'll land on the login screen), but sign-in and data need a
real project — see below.

### Connecting Firebase

1. Create a project at console.firebase.google.com.
2. Enable **Authentication → Google** sign-in provider.
3. Create a **Firestore Database**.
4. Copy your Web App config into `.env.local`.
5. Add these Firestore Security Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /shoppingLists/{listId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        match /items/{itemId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;

          match /priceHistory/{historyId} {
            allow read, write: if request.auth != null && request.auth.uid == userId;
          }
        }
      }
    }
  }
}
```

### A note on fonts

`app/layout.tsx` uses a system font stack instead of `next/font/google`,
because this was scaffolded in a sandbox that couldn't reach
`fonts.googleapis.com`. With normal internet access, swap in real Inter +
Geist Mono:

```tsx
import { Inter, Geist_Mono } from "next/font/google";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```

...then add `${inter.variable} ${geistMono.variable}` back to the `<body>`
className. The CSS variable names in `globals.css` already expect this.

## What's inside

**Dashboard** — budget KPI cards, circular budget-usage ring, spending trend
chart, recent lists, rule-based smart insights, copy-previous-month, quick
list creation.

**Shopping Lists** — search / filter (month, year, status) / sort, responsive
cards, duplicate / archive / delete, empty and loading states.

**List detail** — live items table (desktop) / cards (mobile), inline status
and price-difference indicators, sticky budget summary panel, per-item price
history with trend chart + high/low/average, export to PDF/CSV/Excel.

**Analytics** — monthly bar chart, planned-vs-actual grouped bar chart,
spending trend line, category donut chart, year-over-year comparison,
budget-usage ring, smart insights.

**Settings / Profile** — monthly budget, currency, theme.

**Cross-cutting** — dark mode (`next-themes`), Firestore offline persistence
+ an offline banner, Framer Motion page transitions, toast notifications for
every mutation, friendly (never-raw) error messages, keyboard-accessible
Radix primitives throughout.

## Architecture

```
UI Components -> Custom Hooks -> Service Layer -> Firebase SDK -> Firestore
```

- **components/** — `ui/` (shadcn-style primitives, hand-written since
  `ui.shadcn.com` wasn't reachable from the build sandbox — same code, no CLI
  needed), plus feature folders (`dashboard/`, `shopping/`, `analytics/`,
  `settings/`, `layout/`, `shared/`)
- **hooks/** — `useAuth`, `useShoppingLists`, `useShoppingList`, `useBudget`,
  `useAnalytics` — all real-time where Firestore supports it
- **services/** — every Firestore/Firebase call lives here; never called
  directly from components
- **lib/** — `calculations.ts` (every budget/price formula, single source of
  truth), `currency.ts`, `date.ts`, `errors.ts`, `export.ts` (lazy-loaded
  PDF/CSV/Excel), `insights.ts`, `utils.ts`
- **types/** — every domain entity and enum
- **schemas/** — Zod validation for every form
- **constants/** — nav items, collection names, currency/unit options
- **firebase/** — centralized, singleton Firebase initialization with a
  build-safe fallback config

### Firestore data shape

```
users/{userId}
  shoppingLists/{listId}
    items/{itemId}
      priceHistory/{historyId}
```

Every document is scoped to exactly one user; the security rules above
enforce that at the database level, not just in the UI.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Radix UI (shadcn-style components) · Framer Motion · Lucide React ·
React Hook Form · Zod · Recharts · Sonner · next-themes · Firebase
(Auth/Firestore/Storage) · jsPDF + jspdf-autotable · SheetJS · PapaParse

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # ESLint
```

## Known gaps / good next steps

- **Firestore composite indexes**: the `where(status) + orderBy(createdAt)`
  query in `subscribeToActiveShoppingLists` will prompt Firebase to ask you
  to create a composite index the first time it runs — click the link in the
  console error, it's a one-time setup.
- **PWA icons** are a single SVG for now; add proper PNG icon sizes
  (192×192, 512×512) for stricter platforms (iOS home-screen icons in
  particular want PNG).
- **Service worker** for true offline page-shell caching isn't wired up —
  Firestore's offline persistence covers data, but the app shell itself
  still needs network on first load. `next-pwa` or a hand-rolled service
  worker would close this gap.
- **Category/unit lists** are hardcoded in `constants/index.ts` — fine for
  now, but if this grows, move them to Firestore so users can customize.
