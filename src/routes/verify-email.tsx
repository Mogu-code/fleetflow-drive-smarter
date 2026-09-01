import React, { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { MailCheck, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify Your Email — FleetFlow" },
      {
        name: "description",
        content: "Verify your email address to activate your FleetFlow account.",
      },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const router = useRouter();
  const { user, verifyEmail } = useAuth();
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentMsg, setResentMsg] = useState(false);

  const handleVerifyNow = async () => {
    await verifyEmail();
    setVerified(true);
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResentMsg(true);
    }, 800);
  };

  return (
    <AuthLayout
      title="Verify your email address"
      subtitle="We have dispatched a verification link to your email."
    >
      <div className="p-6 rounded-2xl bg-surface-2 border border-border text-center space-y-5 animate-rise">
        <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mx-auto">
          <MailCheck className="w-7 h-7" />
        </div>

        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            {user?.email || "aarav.sharma@example.com"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Click the verification link in the email we sent you, or click below to simulate instant verification in demo mode.
          </p>
        </div>

        {resentMsg && (
          <div className="p-3 rounded-xl bg-success/20 text-success text-xs font-semibold">
            ✓ Verification link resent to your email!
          </div>
        )}

        {!verified ? (
          <div className="space-y-3 pt-2">
            <Button onClick={handleVerifyNow} className="w-full font-semibold gap-2">
              <CheckCircle2 className="w-4 h-4" /> Simulate Email Verification
            </Button>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              {resending ? "Resending link..." : "Resend verification email"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-success/20 border border-success/40 text-success text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Email Verified Successfully!
            </div>
            <Button asChild className="w-full font-semibold gap-2">
              <Link to="/dashboard">
                Continue to Renter Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
