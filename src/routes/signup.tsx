import React, { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — FleetFlow Mobility" },
      {
        name: "description",
        content: "Register a new self-drive renter account on FleetFlow.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const router = useRouter();
  const { signup, loading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please provide your first and last name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!termsAccepted) {
      setError("You must accept the FleetFlow Terms of Service to proceed.");
      return;
    }

    const res = await signup({
      firstName,
      lastName,
      email,
      phone,
      password,
      termsAccepted,
    });

    if (res.success) {
      router.navigate({ to: "/verify-email" });
    }
  };

  return (
    <AuthLayout
      title="Create your FleetFlow account"
      subtitle="Join thousands of self-drive renters and access verified premium vehicles."
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/40 text-destructive text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Aarav"
                className="w-full rounded-lg bg-surface-2 border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full rounded-lg bg-surface-2 border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav.sharma@example.com"
              className="w-full rounded-lg bg-surface-2 border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mobile Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg bg-surface-2 border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Create Password
            </label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              showRequirements={true}
              placeholder="Choose a strong password"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter password"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2 border border-border text-xs">
            <label className="flex items-start gap-2 cursor-pointer text-muted-foreground leading-relaxed">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span>
                I agree to FleetFlow's <a href="#" className="text-primary underline">Terms of Service</a>, <a href="#" className="text-primary underline">Privacy Policy</a>, and vehicle rental agreement terms.
              </span>
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full font-semibold gap-2 py-2.5">
            {loading ? "Creating Account..." : "Create FleetFlow Account"} <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold underline hover:no-underline">
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
