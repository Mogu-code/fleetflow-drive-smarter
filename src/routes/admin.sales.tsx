import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shield, TrendingUp, Users, Calendar, CheckCircle2, Clock, ArrowRight } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { bookingService, vehicleService, customerService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/admin/sales")({
  head: () => ({
    meta: [
      { title: "Salesperson Operations Portal — FleetFlow" },
      {
        name: "description",
        content: "Sales pipeline dashboard, daily bookings management, and customer reservation confirmations.",
      },
    ],
  }),
  component: SalespersonPortal,
});

function SalespersonPortal() {
  const { user } = useAuth();

  const { data: bookings, isPending } = useQuery({
    queryKey: ["bookings", "sales-portal"],
    queryFn: () => bookingService.listAll(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "sales-portal"],
    queryFn: () => vehicleService.list({}),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers", "sales-portal"],
    queryFn: () => customerService.list(),
  });

  return (
    <ProtectedRoute allowedRoles={["Salesperson", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="border-b border-border/80 pb-6">
            <div className="flex items-center gap-2">
              <Eyebrow>SALES DESK</Eyebrow>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                Staff: {user?.name || "Sarah Mitchell"}
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" /> Sales Operations & Pipeline
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track customer bookings, process pickup confirmations, and monitor daily revenue commissions.
            </p>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Today's Bookings</span>
              <div className="font-display font-bold text-2xl text-foreground num">
                {bookings?.filter((b) => b.status === "confirmed" || b.status === "active").length || 6}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Pending Requests</span>
              <div className="font-display font-bold text-2xl text-warning num">2</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Active Customers</span>
              <div className="font-display font-bold text-2xl text-foreground num">{customers?.length || 12}</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Sales Revenue</span>
              <div className="font-display font-bold text-2xl text-primary num">{inr(1542000)}</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Conversion Rate</span>
              <div className="font-display font-bold text-2xl text-success num">84.2%</div>
            </div>
          </div>

          {/* Today's Sales Activity Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-foreground">Today's Sales Activity & Queue</h3>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/customers">View Customer Roster</Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Rental Dates</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Sales Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">Loading sales queue...</td>
                    </tr>
                  ) : bookings?.map((b) => {
                    const v = vehicles?.find((veh) => veh.id === b.vehicleId);
                    return (
                      <tr key={b.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-foreground">{b.id}</td>
                        <td className="p-3 font-mono text-muted-foreground">{b.customerId}</td>
                        <td className="p-3 font-semibold text-foreground">{v?.name || b.vehicleId}</td>
                        <td className="p-3 text-muted-foreground">{b.startDate} to {b.endDate}</td>
                        <td className="p-3 font-mono font-bold text-primary">{inr(b.total)}</td>
                        <td className="p-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-3 text-right">
                          <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                            <Link to="/bookings/$id" params={{ id: b.id }}>Confirm Pickup</Link>
                          </Button>
                        </td>
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
