import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  Car,
  Star,
  DollarSign,
  AlertCircle,
  FileText,
  Search,
} from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { bookingService, vehicleService, customerService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";
import { PresentationBar } from "@/components/fleet/presentation-bar";

export const Route = createFileRoute("/admin/sales")({
  head: () => ({
    meta: [
      { title: "Sales Workspace & Desk — FleetFlow Operations" },
      {
        name: "description",
        content: "Salesperson operational desk: Customer handling, reservation pipeline, vehicle availability, commission performance, and customer reviews.",
      },
    ],
  }),
  component: SalespersonPortal,
});

function SalespersonPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: bookings, isPending: bookingsPending } = useQuery({
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
          {/* Header & Staff Identity Banner */}
          <div className="p-6 rounded-3xl bg-surface border border-border flex flex-wrap items-center justify-between gap-6 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>SALES WORKSPACE</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  E-ID: E301 • {user?.name || "Sarah Mitchell"}
                </span>
                <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-surface-2 text-muted-foreground">
                  Indiranagar Hub
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Shield className="w-7 h-7 text-primary" /> Vehicle Rental Sales Desk
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Process customer reservations, track vehicle availability, monitor commission targets, and review feedback.
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate({ to: "/explore" })} className="gap-1.5 font-semibold">
                <PlusCircle className="w-4 h-4" /> New Customer Booking
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/vehicles" })} className="gap-1.5">
                <Car className="w-4 h-4 text-primary" /> Vehicle Availability
              </Button>
            </div>
          </div>

          {/* Today's Overview Metrics Row */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">New Bookings</span>
              <div className="font-display font-bold text-2xl text-foreground num">
                {bookings?.filter((b) => b.status === "confirmed").length || 4}
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
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Available Vehicles</span>
              <div className="font-display font-bold text-2xl text-success num">
                {vehicles?.filter((v) => v.status === "available").length || 5}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Rented Vehicles</span>
              <div className="font-display font-bold text-2xl text-primary num">
                {vehicles?.filter((v) => v.status === "rented").length || 3}
              </div>
            </div>
          </div>

          {/* Sales Target & Commission Performance Progress Widget */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-base text-foreground">Monthly Sales Target & Commission Performance</h3>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4 items-center">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Monthly Target (DBMS Model):</span>
                <div className="font-mono font-bold text-lg text-foreground">{inr(targetAmount)}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Achieved Sales Revenue:</span>
                <div className="font-mono font-bold text-lg text-primary">{inr(achievedAmount)}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Remaining to Target:</span>
                <div className="font-mono font-bold text-lg text-warning">{inr(remainingAmount)}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Commission Earned (3.5%):</span>
                <div className="font-mono font-bold text-lg text-success">{inr(commissionEarned)}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Target Progress</span>
                <span className="text-primary font-mono font-bold">{achievementPct}% Achieved</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-2 overflow-hidden border border-border">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${achievementPct}%` }} />
              </div>
            </div>
          </div>

          {/* "CUSTOMERS I HANDLE" SECTION (BOOKS M:N Relational Table Visualizer) */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold text-lg text-foreground">Customers I Handle</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    DBMS BOOKS Junction Table (M:N)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customers mapped to Salesperson E311 via composite keys (C-ID ↔ E-ID).
                </p>
              </div>

              <Button asChild size="sm" variant="outline">
                <Link to="/admin/customers">View All Customers</Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50 font-mono">
                  <tr>
                    <th className="p-3">Customer C-ID</th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Contact Mob-No</th>
                    <th className="p-3">Total Rentals</th>
                    <th className="p-3">Total Spend</th>
                    <th className="p-3">Preferred Category</th>
                    <th className="p-3 text-right">Sales Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {customers?.slice(0, 5).map((c) => (
                    <tr key={c.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">{c.id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{c.name}</div>
                        <div className="text-[10px] text-muted-foreground">{c.email}</div>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">{c.phone}</td>
                      <td className="p-3 font-mono font-bold text-foreground">{c.totalBookings}</td>
                      <td className="p-3 font-mono font-bold text-primary">{inr(c.totalSpend)}</td>
                      <td className="p-3 text-muted-foreground">Luxury / SUV</td>
                      <td className="p-3 text-right flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => navigate({ to: "/explore" })}
                        >
                          + Book Car
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Sales Activity Queue */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="font-display font-semibold text-lg text-foreground">Today's Booking Pipeline Queue</h3>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/bookings">View All Bookings</Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50 font-mono">
                  <tr>
                    <th className="p-3">Contract RA-ID</th>
                    <th className="p-3">Customer C-ID</th>
                    <th className="p-3">Vehicle V-ID</th>
                    <th className="p-3">Rental Dates</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Pipeline Status</th>
                    <th className="p-3 text-right">Desk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {bookingsPending ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">Loading sales queue...</td>
                    </tr>
                  ) : bookings?.slice(0, 6).map((b) => {
                    const v = vehicles?.find((veh) => veh.id === b.vehicleId);
                    return (
                      <tr key={b.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-foreground">{b.agreementId || `RA-${b.id}`}</td>
                        <td className="p-3 font-mono text-primary font-bold">{b.customerId}</td>
                        <td className="p-3 font-mono text-muted-foreground">
                          {b.vehicleId} ({v?.model || "Volvo XC60"})
                        </td>
                        <td className="p-3 text-muted-foreground">{b.startDate} to {b.endDate}</td>
                        <td className="p-3 font-mono font-bold text-primary">{inr(b.total)}</td>
                        <td className="p-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-3 text-right">
                          <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                            <Link to="/bookings/$id" params={{ id: b.id }}>View Contract</Link>
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
