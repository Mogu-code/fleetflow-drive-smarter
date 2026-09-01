import React from "react";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/types/auth";
import { UserCheck, Shield, Wrench, LayoutDashboard } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function DemoAccessPanel({ redirectUrl }: { redirectUrl?: string }) {
  const { loginAsDemo, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const DEMO_ROLES: { id: UserRole; title: string; name: string; email: string; desc: string; icon: React.ElementType }[] = [
    {
      id: "Customer",
      title: "Customer",
      name: "Alex Morgan",
      email: "alex@fleetflow.demo",
      desc: "Self-drive renter dashboard & bookings",
      icon: UserCheck,
    },
    {
      id: "Salesperson",
      title: "Salesperson",
      name: "Sarah Mitchell",
      email: "sarah@fleetflow.demo",
      desc: "Customer pipeline & booking commissions",
      icon: Shield,
    },
    {
      id: "Mechanic",
      title: "Mechanic",
      name: "Daniel Carter",
      email: "daniel@fleetflow.demo",
      desc: "Service work orders & vehicle diagnostics",
      icon: Wrench,
    },
    {
      id: "Manager",
      title: "Manager",
      name: "Michael Anderson",
      email: "michael@fleetflow.demo",
      desc: "Full enterprise fleet operations & health analytics",
      icon: LayoutDashboard,
    },
  ];

  const handleSelectRole = async (r: UserRole) => {
    await loginAsDemo(r);
    if (redirectUrl) {
      navigate({ to: redirectUrl as any });
    } else if (r === "Customer") {
      navigate({ to: "/dashboard" });
    } else if (r === "Salesperson") {
      navigate({ to: "/admin/sales" });
    } else if (r === "Mechanic") {
      navigate({ to: "/admin/mechanic" });
    } else {
      navigate({ to: "/admin" });
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <span className="font-display font-semibold text-xs text-foreground uppercase tracking-wider">
          Demo Access Accounts
        </span>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">
          Portfolio Mode
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Select a dedicated demo account to evaluate role-specific capabilities:
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {DEMO_ROLES.map((r) => {
          const Icon = r.icon;
          const isSelected = role === r.id && isAuthenticated;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelectRole(r.id)}
              className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] ${
                isSelected
                  ? "bg-primary/20 border-primary ring-1 ring-primary"
                  : "bg-surface border-border/80 hover:border-primary/50 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{r.name}</span>
              </div>
              <div className="text-[10px] font-mono text-primary mt-0.5">{r.email}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
