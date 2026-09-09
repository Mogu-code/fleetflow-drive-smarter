import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Award, Target, CheckCircle2 } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { inr } from "@/lib/format";
import { bookingService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";
import { PresentationBar } from "@/components/fleet/presentation-bar";

export const Route = createFileRoute("/admin/sales/performance")({
  head: () => ({
    meta: [
      { title: "Sales Performance & Commission Tracker — FleetFlow Desk" },
      {
        name: "description",
        content: "Track salesperson target achievement, commission breakdown, and deals closed ledger.",
      },
    ],
  }),
  component: SalesPerformancePage,
});

function SalesPerformancePage() {
  const { user } = useAuth();

  const { data: bookings, isPending } = useQuery({
    queryKey: ["bookings", "sales-performance"],
    queryFn: () => bookingService.listAll(),
  });

  const targetAmount = 1800000;
  const achievedAmount = 1542000;
  const achievementPct = ((achievedAmount / targetAmount) * 100).toFixed(1);
  const remainingAmount = targetAmount - achievedAmount;
  const commissionRate = 3.5;
  const commissionEarned = (achievedAmount * (commissionRate / 100));

  return (
    <ProtectedRoute allowedRoles={["Salesperson", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>COMPENSATION & TARGETS</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  SALESPERSON E-ID: E301
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-primary" /> Sales Target & Commission Performance
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Relational model metrics: E-ID, Monthly Target, Commission Rate (3.5%), and Deals Closed Ledger.
              </p>
            </div>
          </div>

          {/* Performance Summary Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase">Monthly Target</span>
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div className="font-mono font-bold text-2xl text-foreground">{inr(targetAmount)}</div>
              <div className="text-[11px] text-muted-foreground">DBMS Salesperson Target Attribute</div>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase">Achieved Sales Revenue</span>
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div className="font-mono font-bold text-2xl text-primary">{inr(achievedAmount)}</div>
              <div className="text-[11px] text-success font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {achievementPct}% of Target Met
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase">Remaining Target</span>
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <div className="font-mono font-bold text-2xl text-warning">{inr(remainingAmount)}</div>
              <div className="text-[11px] text-muted-foreground">Needed by month-end</div>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase">Commission Earned</span>
                <DollarSign className="w-4 h-4 text-success" />
              </div>
              <div className="font-mono font-bold text-2xl text-success">{inr(commissionEarned)}</div>
              <div className="text-[11px] text-muted-foreground">Commission Rate: 3.5% on sales</div>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-foreground">Monthly Sales Target Progress</span>
              <span className="font-mono text-primary font-bold">{achievementPct}% Achieved</span>
            </div>
            <div className="w-full h-4 rounded-full bg-surface-2 overflow-hidden border border-border">
              <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${achievementPct}%` }} />
            </div>
          </div>

          {/* Commission Deals Ledger */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <h3 className="font-display font-semibold text-lg text-foreground">Closed Bookings & Commission Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground bg-surface-2">
                  <tr>
                    <th className="p-3">Booking RA-ID</th>
                    <th className="p-3">Customer C-ID</th>
                    <th className="p-3">Booking Date</th>
                    <th className="p-3">Rental Total</th>
                    <th className="p-3">Commission Rate</th>
                    <th className="p-3">Commission Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-[11px]">
                  {isPending ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading commission ledger...</td>
                    </tr>
                  ) : bookings?.slice(0, 8).map((b) => {
                    const comm = b.total * 0.035;
                    return (
                      <tr key={b.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-bold text-foreground">{b.agreementId || `RA-${b.id}`}</td>
                        <td className="p-3 font-bold text-primary">{b.customerId}</td>
                        <td className="p-3 text-muted-foreground">{b.startDate}</td>
                        <td className="p-3 font-bold text-foreground">{inr(b.total)}</td>
                        <td className="p-3 text-muted-foreground">3.5%</td>
                        <td className="p-3 font-bold text-success">{inr(comm)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
