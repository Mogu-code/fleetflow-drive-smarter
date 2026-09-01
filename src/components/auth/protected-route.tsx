import React from "react";
import { useAuth } from "@/lib/auth/auth-context";
import type { Permission } from "@/lib/auth/permissions";
import type { UserRole } from "@/types/auth";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SiteFooter } from "@/components/fleet/site-chrome";
import { SwitchAccountModal } from "./switch-account-modal";

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermission,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
}) {
  const { isAuthenticated, user, role, can } = useAuth();
  const [switchModalOpen, setSwitchModalOpen] = React.useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-20 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-display font-semibold text-2xl text-foreground">Authentication Required</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please sign in to your FleetFlow account or choose a demo persona to access this area.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button asChild className="font-semibold">
              <Link to="/login">Sign In / Select Demo Account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Go to Homepage</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Evaluate permission derived from session
  let isAuthorized = true;
  if (allowedRoles && !allowedRoles.includes(role)) {
    isAuthorized = false;
  }
  if (requiredPermission && !can(requiredPermission)) {
    isAuthorized = false;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-20 text-center space-y-6 animate-rise">
          <div className="w-14 h-14 rounded-full bg-destructive/20 text-destructive border border-destructive/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive/30">
              403 Access Restricted
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
              Unauthorized Access
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Your active account <strong>{user?.name}</strong> ({role}) does not have permission to view this section.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-border text-xs text-muted-foreground space-y-3 text-left">
            <div className="font-semibold text-foreground">Security Policy:</div>
            <p>
              Direct URL manipulation or role mutation is prohibited. To access this section, sign out of your current account and log in as an authorized role.
            </p>
            <Button size="sm" variant="outline" onClick={() => setSwitchModalOpen(true)} className="w-full gap-2 font-semibold">
              <RefreshCw className="w-3.5 h-3.5 text-primary" /> Switch Demo Account
            </Button>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button asChild variant="outline" className="gap-2">
              <Link to={role === "Customer" ? "/dashboard" : "/admin"}>
                <ArrowLeft className="w-4 h-4" /> Return to Dashboard
              </Link>
            </Button>
          </div>
        </main>
        <SiteFooter />

        <SwitchAccountModal
          isOpen={switchModalOpen}
          onClose={() => setSwitchModalOpen(false)}
        />
      </div>
    );
  }

  return <>{children}</>;
}
