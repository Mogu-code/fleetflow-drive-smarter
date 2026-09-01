import React, { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/types/auth";
import { UserCheck, Shield, Wrench, LayoutDashboard, RefreshCw } from "lucide-react";
import { SwitchAccountModal } from "@/components/auth/switch-account-modal";

export function DemoBar() {
  const { role, user, isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole | undefined>(undefined);

  const ROLES: { id: UserRole; label: string; icon: React.ElementType }[] = [
    { id: "Customer", label: "Customer", icon: UserCheck },
    { id: "Salesperson", label: "Salesperson", icon: Shield },
    { id: "Mechanic", label: "Mechanic", icon: Wrench },
    { id: "Manager", label: "Manager", icon: LayoutDashboard },
  ];

  const handlePersonaClick = (r: UserRole) => {
    if (role === r && isAuthenticated) return;
    setTargetRole(r);
    setModalOpen(true);
  };

  return (
    <>
      <div className="bg-surface-2 border-b border-border/80 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 z-50 relative">
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-foreground font-semibold uppercase tracking-wider text-[10px]">
            Demo Access Mode:
          </span>
          {isAuthenticated && user ? (
            <span>
              Active Account: <strong className="text-foreground">{user.name}</strong> ({user.role})
            </span>
          ) : (
            <span className="text-muted-foreground">Logged Out</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground mr-1 hidden sm:inline uppercase tracking-wider">
            Switch Demo Account:
          </span>
          <div className="flex bg-background/80 rounded-md p-0.5 border border-border/60">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.id && isAuthenticated;
              return (
                <button
                  key={r.id}
                  onClick={() => handlePersonaClick(r.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface"
                  }`}
                  title={`Sign out & switch demo account to ${r.label}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <SwitchAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetRole={targetRole}
      />
    </>
  );
}
