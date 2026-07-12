import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

// NOTE: next/font/google needs to reach fonts.googleapis.com at build time.
// This sandbox's network doesn't allow that domain, so the type scale in
// globals.css uses a system font stack (--font-inter/--font-geist-mono
// resolve to it directly). Outside this sandbox, with normal internet
// access, swap this back to `next/font/google` for real Inter + Geist Mono —
// same variable names, drop-in replacement.

export const metadata: Metadata = {
  title: "SpendSnap — Smart Shopping. Smarter Budgeting.",
  description:
    "Plan your monthly grocery budget, track real spending, and see exactly where your money goes.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "SpendSnap" },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
