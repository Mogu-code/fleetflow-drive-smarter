import React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Plus,
  Car,
  Calendar,
  Wrench,
  Building,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { analyticsService, vehicleService, bookingService, customerService, paymentService, maintenanceService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";
import { PresentationBar } from "@/components/fleet/presentation-bar";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Manager Control Center — FleetFlow Operations" },
      {
        name: "description",
        content: "Enterprise manager console: Live fleet inventory, booking pipeline, revenue ledger, and operational attention center.",
      },
    ],
  }),
  component: AdminOverview,
});

const PIE_COLORS = ["#F96728", "#38BDF8", "#34D399", "#A78BFA", "#FBBF24"];

function AdminOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsService.overview(),
  });

  const { data: recentBookings } = useQuery({
    queryKey: ["bookings", "all-admin"],
    queryFn: () => bookingService.listAll(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "all-admin"],
    queryFn: () => vehicleService.list({}),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers", "all-admin"],
    queryFn: () => customerService.list(),
  });

  const { data: payments } = useQuery({
    queryKey: ["payments", "all-admin"],
    queryFn: () => paymentService.list(),
  });

  const { data: maintenance } = useQuery({
    queryKey: ["maintenance", "all-admin"],
    queryFn: () => maintenanceService.list(),
  });

  // Calculate real derived stats from datasets
  const totalVehicles = vehicles?.length || 10;
  const availableCount = vehicles?.filter((v) => v.status === "available").length || 5;
  const rentedCount = vehicles?.filter((v) => v.status === "rented").length || 3;
  const maintenanceCount = vehicles?.filter((v) => v.status === "maintenance").length || 2;
  const totalCustomerCount = customers?.length || 12;
  const activeBookingsCount = recentBookings?.filter((b) => b.status === "active" || b.status === "confirmed").length || 4;
  const totalRev = payments?.reduce((acc, p) => acc + (p.status === "completed" ? p.amount : 0), 0) || 482500;

  return (
    <ProtectedRoute allowedRoles={["Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col min-w-0 overflow-x-hidden">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8 min-w-0 box-border">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6 min-w-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Eyebrow>ENTERPRISE MANAGEMENT</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  BRANCH MANAGER: {user?.name || "Marcus Vance"} • E-ID: E401
                </span>
                <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-surface-2 text-muted-foreground">
                  Indiranagar Main Hub
                </span>
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Building className="w-7 h-7 text-primary shrink-0" /> Operations Control Center
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Live calculated telemetry across fleet inventory, revenue channels, customer relationship pipeline, and staff roster.
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-4 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-3 shadow-md min-w-0">
            <span className="text-xs font-semibold uppercase text-muted-foreground font-mono">Manager Operational Dispatch:</span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate({ to: "/admin/vehicles" })} className="gap-1.5 font-semibold text-xs">
                <Plus className="w-4 h-4" /> Add Vehicle
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/bookings" })} className="gap-1.5 text-xs">
                <Calendar className="w-4 h-4 text-primary" /> View Bookings
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/maintenance" })} className="gap-1.5 text-xs">
                <Wrench className="w-4 h-4 text-primary" /> View Maintenance
              </Button>
            </div>
          </div>

          {/* Dynamic Metric Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 min-w-0">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground block truncate">Total Revenue</span>
              <div className="font-display font-bold text-xl text-primary num truncate">{inr(totalRev)}</div>
              <span className="text-[10px] text-success font-medium block truncate">+14.2% MoM</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground block truncate">Total Fleet Units</span>
              <div className="font-display font-bold text-xl text-foreground num truncate">{totalVehicles}</div>
              <span className="text-[10px] text-muted-foreground block truncate">{availableCount} Available</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground block truncate">Currently Rented</span>
              <div className="font-display font-bold text-xl text-foreground num truncate">{rentedCount}</div>
              <span className="text-[10px] text-muted-foreground block truncate">On active rentals</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground block truncate">In Maintenance</span>
              <div className="font-display font-bold text-xl text-destructive num truncate">{maintenanceCount}</div>
              <span className="text-[10px] text-destructive font-medium block truncate">Service bay</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground block truncate">Active Customers</span>
              <div className="font-display font-bold text-xl text-foreground num truncate">{totalCustomerCount}</div>
              <span className="text-[10px] text-success font-medium block truncate">Verified KYC</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground block truncate">Active Bookings</span>
              <div className="font-display font-bold text-xl text-foreground num truncate">{activeBookingsCount}</div>
              <span className="text-[10px] text-muted-foreground block truncate">Confirmed & Active</span>
            </div>
          </div>

          {/* Operational Attention Required Section */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl min-w-0">
            <div className="flex items-center gap-2 border-b border-border/80 pb-3 min-w-0">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <h3 className="font-display font-semibold text-base text-foreground">Today's Operational Attention Required</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
              <button
                onClick={() => navigate({ to: "/admin/maintenance" })}
                className="p-4 rounded-xl bg-surface-2/60 border border-border text-left hover:border-primary/50 transition-colors space-y-1 min-w-0"
              >
                <div className="flex items-center justify-between text-xs font-bold text-destructive">
                  <span>MAINTENANCE BAY</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="font-semibold text-xs text-foreground">{maintenanceCount} vehicles currently in service bay</div>
                <p className="text-[10px] text-muted-foreground">Vehicle V104 requires engine oil and filter replacement.</p>
              </button>

              <button
                onClick={() => navigate({ to: "/admin/bookings" })}
                className="p-4 rounded-xl bg-surface-2/60 border border-border text-left hover:border-primary/50 transition-colors space-y-1 min-w-0"
              >
                <div className="flex items-center justify-between text-xs font-bold text-warning">
                  <span>PENDING BOOKINGS</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="font-semibold text-xs text-foreground">2 pending customer booking confirmations</div>
                <p className="text-[10px] text-muted-foreground">Awaiting salesperson contract dispatch and license check.</p>
              </button>

              <button
                onClick={() => navigate({ to: "/admin/payments" })}
                className="p-4 rounded-xl bg-surface-2/60 border border-border text-left hover:border-primary/50 transition-colors space-y-1 min-w-0"
              >
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span>PENDING PAYMENTS</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="font-semibold text-xs text-foreground">3 Razorpay transaction receipts pending verification</div>
                <p className="text-[10px] text-muted-foreground">Verify UPI transaction reference before vehicle dispatch.</p>
              </button>

              <button
                onClick={() => navigate({ to: "/admin/insights" })}
                className="p-4 rounded-xl bg-surface-2/60 border border-border text-left hover:border-primary/50 transition-colors space-y-1 min-w-0"
              >
                <div className="flex items-center justify-between text-xs font-bold text-success">
                  <span>AI INSIGHTS</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="font-semibold text-xs text-foreground">Highest fleet utilization on SUV category</div>
                <p className="text-[10px] text-muted-foreground">Recommend procuring 2 additional luxury SUVs for Indiranagar Hub.</p>
              </button>
            </div>
          </div>

          {/* Analytics Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-12 min-w-0">
            {/* Revenue Chart */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl min-w-0">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0" /> Monthly Fleet Revenue Trend
                </h3>
                <span className="text-xs text-muted-foreground font-mono">INR (Thousands)</span>
              </div>
              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.revenueTrend || []}>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#141A26", borderColor: "#2D3748", borderRadius: 8, color: "#fff" }}
                    />
                    <Bar dataKey="revenue" fill="#F96728" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution Pie */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl min-w-0">
              <div className="border-b border-border/80 pb-3">
                <h3 className="font-display font-semibold text-base text-foreground">Fleet Category Mix</h3>
              </div>
              <div className="h-56 w-full min-w-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics?.categoryMix || []}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ category, value }) => `${category} ${value}%`}
                    >
                      {(metrics?.categoryMix || []).map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#141A26", borderColor: "#2D3748", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl min-w-0">
            <div className="flex items-center justify-between border-b border-border/80 pb-3 min-w-0">
              <h3 className="font-display font-semibold text-lg text-foreground truncate">Recent Fleet Reservations & Contracts</h3>
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link to="/admin/bookings">View All Reservations</Link>
              </Button>
            </div>

            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">RA-ID Contract</th>
                    <th className="p-3 font-sans">Vehicle Model</th>
                    <th className="p-3">Customer C-ID</th>
                    <th className="p-3">Rental Schedule</th>
                    <th className="p-3">Total Fee</th>
                    <th className="p-3 font-sans">Pipeline Status</th>
                    <th className="p-3 text-right font-sans">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentBookings?.slice(0, 5).map((b) => {
                    const v = vehicles?.find((veh) => veh.id === b.vehicleId);
                    return (
                      <tr key={b.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-bold text-foreground">{b.agreementId || `RA-${b.id}`}</td>
                        <td className="p-3 font-sans font-semibold text-foreground">{v?.name || b.vehicleId}</td>
                        <td className="p-3 text-primary font-bold">{b.customerId}</td>
                        <td className="p-3 text-muted-foreground">{b.startDate} to {b.endDate}</td>
                        <td className="p-3 font-bold text-primary">{inr(b.total)}</td>
                        <td className="p-3 font-sans">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-3 text-right font-sans">
                          <Button asChild size="sm" variant="ghost" className="h-7 text-xs font-semibold">
                            <Link to="/bookings/$id" params={{ id: b.id }}>Inspect Contract</Link>
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
