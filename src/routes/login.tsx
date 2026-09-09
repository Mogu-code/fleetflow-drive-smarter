import React, { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { DemoAccessPanel } from "@/components/auth/demo-access-panel";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, CheckCircle2, UserCheck, Shield, Wrench, LayoutDashboard } from "lucide-react";
import type { UserRole } from "@/types/auth";

type LoginSearch = {
  redirect?: string | undefined;
  registered?: boolean | undefined;
  targetRole?: string | undefined;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
    registered: search["registered"] === true || search["registered"] === "true",
    targetRole: typeof search["targetRole"] === "string" ? search["targetRole"] : undefined,
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

const ROLE_PRESETS: { id: UserRole; label: string; email: string; icon: React.ElementType; desc: string }[] = [
  {
    id: "Customer",
    label: "Customer",
    email: "alex@fleetflow.demo",
    icon: UserCheck,
    desc: "Self-drive Renter",
  },
  {
    id: "Salesperson",
    label: "Salesperson",
    email: "sarah@fleetflow.demo",
    icon: Shield,
    desc: "Sales Pipeline & Desk",
  },
  {
    id: "Mechanic",
    label: "Mechanic",
    email: "daniel@fleetflow.demo",
    icon: Wrench,
    desc: "Service Bay & Maintenance",
  },
  {
    id: "Manager",
    label: "Manager",
    email: "michael@fleetflow.demo",
    icon: LayoutDashboard,
    desc: "Full Enterprise Fleet Ops",
  },
];

function LoginPage() {
  const { redirect, registered, targetRole } = Route.useSearch();
  const router = useRouter();
  const { login, loginAsDemo, loading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>((targetRole as UserRole) || "Customer");
  const [email, setEmail] = useState(() => {
    const preset = ROLE_PRESETS.find((r) => r.id === (targetRole as UserRole));
    return preset ? preset.email : "alex@fleetflow.demo";
  });
  const [password, setPassword] = useState("FleetFlow#2026");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (roleId: UserRole) => {
    setSelectedRole(roleId);
    const preset = ROLE_PRESETS.find((r) => r.id === roleId);
    if (preset) {
      setEmail(preset.email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // Authenticate with selected role preset or login credentials
    const preset = ROLE_PRESETS.find((r) => r.id === selectedRole);
    if (preset && email.trim().toLowerCase() === preset.email.toLowerCase()) {
      await loginAsDemo(selectedRole);
    } else {
      const res = await login({ email, password, rememberMe });
      if (!res.success) {
        setError(res.error || "Invalid credentials. Please try again.");
        return;
      }
    }

    // Navigate to role landing route
    if (redirect) {
      router.navigate({ to: redirect as any });
    } else if (selectedRole === "Customer") {
      router.navigate({ to: "/dashboard" });
    } else if (selectedRole === "Salesperson") {
      router.navigate({ to: "/admin/sales" });
    } else if (selectedRole === "Mechanic") {
      router.navigate({ to: "/admin/mechanic" });
    } else {
      router.navigate({ to: "/admin" });
    }
  };

  return (
    <AuthLayout
      title="Welcome back to FleetFlow"
      subtitle="Select your account role below to sign in to your dashboard."
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

        {/* ROLE SELECTION BAR */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            Select Account Role To Sign In As:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROLE_PRESETS.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "bg-primary/20 border-primary text-primary font-bold ring-1 ring-primary"
                      : "bg-surface-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <div className="text-xs font-semibold">{r.label}</div>
                  <div className="text-[9px] text-muted-foreground opacity-80">{r.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sign In Email ({selectedRole} Account)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@fleetflow.demo"
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
            {loading ? "Signing in..." : `Sign In as ${selectedRole}`} <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

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
