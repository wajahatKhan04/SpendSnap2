"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, TrendingDown, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/constants";
import { toFriendlyError } from "@/lib/errors";
import { useAuth } from "@/hooks/useAuth";

const HIGHLIGHTS = [
  { icon: TrendingDown, text: "Track price changes on every item you buy" },
  { icon: ShieldCheck, text: "Stay within budget, every single month" },
  { icon: Sparkles, text: "Get smart insights on your spending habits" },
];

export default function LoginPage() {
  const { signIn, firebaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseUser) {
      router.replace("/dashboard");
    }
  }, [firebaseUser, router]);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : toFriendlyError(err));
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-white/15">
            <Receipt className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">{APP_NAME}</span>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-display text-white">{APP_TAGLINE}</p>
            <p className="max-w-md text-body-lg text-white/80">
              SpendSnap turns your monthly grocery runs into clear, actionable
              financial insight — so you always know where the money goes.
            </p>
          </div>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/60">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </div>

      {/* Right: sign-in panel */}
      <div className="flex flex-col items-center justify-center gap-8 px-6 py-16">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-primary-foreground">
            <Receipt className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">{APP_NAME}</span>
        </div>

        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-h1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to plan, track, and understand your grocery spending.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            variant="outline"
            onClick={handleSignIn}
            disabled={loading}
          >
            <GoogleIcon className="h-4 w-4" />
            {loading ? "Signing in…" : "Continue with Google"}
          </Button>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            By continuing, you agree to SpendSnap&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.96 11.96 0 000 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}