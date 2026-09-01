import React from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "@tanstack/react-router";
import { LogOut, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SwitchAccountModal({
  isOpen,
  onClose,
  targetRole,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: string;
}) {
  const { logout, user } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirmSwitch = async () => {
    onClose();
    // 1. Perform clean logout & clear session state
    await logout();
    // 2. Redirect to /login in demo selection mode
    router.navigate({ to: "/login", search: { mode: "demo", targetRole } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2 font-display font-semibold text-foreground text-base">
            <AlertTriangle className="w-5 h-5 text-warning" /> Switch Demo Account?
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            You are currently signed in as <strong className="text-foreground">{user?.name || "Active Renter"}</strong> ({user?.role}).
          </p>
          <p className="p-3 rounded-xl bg-surface-2 border border-border text-foreground font-medium">
            To enforce real security boundaries, switching demo identities will sign you out of your current session before logging in as a new user.
          </p>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirmSwitch} className="gap-1.5 font-semibold">
            <LogOut className="w-3.5 h-3.5" /> Sign Out & Switch
          </Button>
        </div>
      </div>
    </div>
  );
}
