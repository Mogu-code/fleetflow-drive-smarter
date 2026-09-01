import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { authService } from "@/lib/auth/auth-service";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — FleetFlow" },
      {
        name: "description",
        content: "Reset your FleetFlow account password.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    await authService.resetPassword(email);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter the email address associated with your account and we will send password reset instructions."
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg bg-surface-2 border border-border pl-9 pr-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading || !email.trim()} className="w-full font-semibold">
            {loading ? "Sending instructions..." : "Send Reset Link"}
          </Button>

          <div className="text-center text-xs text-muted-foreground pt-2">
            Remembered your password?{" "}
            <Link to="/login" className="text-primary font-semibold underline">
              Return to Login
            </Link>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl bg-surface-2 border border-border space-y-4 animate-rise text-center">
          <div className="w-12 h-12 rounded-full bg-success/20 text-success border border-success/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground">Reset Request Dispatched</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            If an account exists for <strong className="text-foreground">{email}</strong>, password reset instructions have been dispatched. (Simulated Demo Request).
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button asChild size="sm">
              <Link to="/reset-password">Proceed to Reset Password Page</Link>
            </Button>
            <Link to="/login" className="text-xs text-muted-foreground underline">
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
