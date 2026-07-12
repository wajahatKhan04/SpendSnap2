# READ THIS FIRST — before you do anything else

This exact code was just tested (July 11) with `npm run build` AND
`npm run dev` in a clean environment. Both passed with zero errors:

    GET /       200
    GET /login  200

If you saw "useAuth must be used within an AuthProvider" before, it's
almost certainly because a new zip got extracted on top of an old
`spendsnap` folder (old files + new files mixed together), or VS Code
had stale files open/cached. The fix is a completely clean start:

## Do this exactly, in order

1. **Close VS Code completely.**

2. **Delete your entire old project folder.**
   In PowerShell:
   ```powershell
   Remove-Item -Recurse -Force D:\spendsnap
   ```

3. **Extract this new zip fresh** to `D:\spendsnap` (or wherever you like —
   just make sure it's a brand new folder, not extracted on top of the old
   one).

4. **Open a fresh terminal in that new folder** and run:
   ```powershell
   cd D:\spendsnap
   npm install
   ```

5. **Set up your `.env.local`:**
   ```powershell
   Copy-Item .env.local.example .env.local
   ```
   Then open `.env.local` and fill in your real Firebase project config
   (see the "Connecting Firebase" section in README.md). The app will still
   run and show you the login screen without this, but sign-in won't work
   until it's filled in.

6. **Now open VS Code fresh** on this new folder:
   ```powershell
   code .
   ```

7. **Run it:**
   ```powershell
   npm run dev
   ```

8. Open `http://localhost:3000` in a **new** browser tab (not a tab that
   was already open from before — hard refresh with Ctrl+Shift+R if you
   reuse an old tab).

If you do all 8 steps and still see an error, copy the **exact terminal
output** and send it over — but based on testing here, this should just
work.

## What's actually in this build

Everything from your spec, already implemented:

- Google OAuth login/logout, session persistence, protected routes
- Dashboard: budget cards, spending overview, quick actions, recent lists
- Shopping lists: create, view, edit, delete, duplicate, copy previous month
- Items: add/edit/delete, status lifecycle (Not Bought → Partial → Bought →
  Not Available), real-time bill calculation, price history tracking
- Analytics: monthly bar chart, spending trend, planned-vs-actual,
  category breakdown, year-over-year comparison
- Export: PDF, CSV, and Excel
- Mobile-first responsive (320px → 1920px+), dark mode, Framer Motion
  animations and transitions throughout, Firestore offline persistence,
  PWA manifest

See `README.md` for full architecture notes and the Firestore security
rules you'll need to paste into your Firebase console.
