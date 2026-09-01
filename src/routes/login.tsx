import React, { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { DemoAccessPanel } from "@/components/auth/demo-access-panel";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

type LoginSearch = {
  redirect?: string | undefined;
  registered?: boolean | undefined;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
    registered: search["registered"] === true || search["registered"] === "true",
  }),
  head: () => ({
    meta: [
      { title: "Sign In — FleetFlow Mobility" },
      {
        name: "description",
        content: "Sign in to your FleetFlow account to manage reservations, profile, and rental history.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect, registered } = Route.useSearch();
  const router = useRouter();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("aviskha.talukdar@example.com");
  const [password, setPassword] = useState("FleetFlow#2026");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const res = await login({ email, password, rememberMe });
    if (res.success) {
      if (redirect) {
        router.navigate({ to: redirect as any });
      } else {
        router.navigate({ to: "/dashboard" });
      }
    } else {
      setError(res.error || "Invalid credentials. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Welcome back to FleetFlow"
      subtitle="Sign in to your account to manage reservations & vehicle telemetry."
    >
      <div className="space-y-6">
        {registered && (
          <div className="p-3.5 rounded-xl bg-success/20 border border-success/40 text-success text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Account created successfully! Please sign in below.
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/40 text-destructive text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg bg-surface-2 border border-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <PasswordInput value={password} onChange={setPassword} />
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-primary rounded border-border"
              />
              <span>Remember this device</span>
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full font-semibold gap-2 py-2.5">
            {loading ? "Signing in..." : "Sign In to Account"} <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Social Mock Buttons */}
        <div className="space-y-3 pt-2 border-t border-border/80 text-center">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider bg-background px-2 relative -top-5">
            Or continue with
          </span>
          <div className="grid grid-cols-2 gap-3 -mt-2">
            <button
              type="button"
              onClick={() => setEmail("aviskha.talukdar@example.com")}
              className="p-2.5 rounded-xl bg-surface-2 border border-border hover:border-primary/50 text-xs font-medium text-foreground transition-all flex items-center justify-center gap-2"
            >
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => setEmail("aviskha.talukdar@example.com")}
              className="p-2.5 rounded-xl bg-surface-2 border border-border hover:border-primary/50 text-xs font-medium text-foreground transition-all flex items-center justify-center gap-2"
            >
              <span>Apple ID</span>
            </button>
          </div>
        </div>

        {/* Demo Access Panel */}
        <DemoAccessPanel redirectUrl={redirect} />

        <div className="text-center text-xs text-muted-foreground pt-2">
          Don't have a FleetFlow account?{" "}
          <Link to="/signup" className="text-primary font-semibold underline hover:no-underline">
            Create Account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
