import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { analyticsService, vehicleService, bookingService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Enterprise Admin Console — FleetFlow" },
      {
        name: "description",
        content: "Enterprise fleet operational metrics, dynamic revenue analytics, utilization trends, and vehicle management.",
      },
    ],
  }),
  component: AdminOverview,
});

const PIE_COLORS = ["#F96728", "#38BDF8", "#34D399", "#A78BFA", "#FBBF24"];

function AdminOverview() {
  const { role, user } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsService.overview(),
  });

  const { data: health } = useQuery({
    queryKey: ["analytics", "health"],
    queryFn: () => analyticsService.fleetHealth(),
  });

  const { data: recentBookings } = useQuery({
    queryKey: ["bookings", "all-admin"],
    queryFn: () => bookingService.listAll(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "all-admin"],
    queryFn: () => vehicleService.list({}),
  });

  return (
    <ProtectedRoute allowedRoles={["Manager", "Salesperson", "Mechanic"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>ENTERPRISE MANAGEMENT</Eyebrow>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  Persona: {role} ({user?.name})
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                Operations Control Center
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Live calculated telemetry across fleet inventory, revenue channels, and maintenance.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" className="gap-1.5">
                <Link to="/admin/vehicles">
                  <Plus className="w-4 h-4" /> Add New Vehicle
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/health">
                  Fleet Health Index ({health?.overallScore ?? 91}/100)
                </Link>
              </Button>
            </div>
          </div>

          {/* Dynamic Metric Cards Row */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Total Revenue</span>
              <div className="font-display font-bold text-xl text-primary num">{inr(metrics?.revenue || 142800)}</div>
              <span className="text-[10px] text-success font-medium">+9.4% vs last mo</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Active Rentals</span>
              <div className="font-display font-bold text-xl text-foreground num">{metrics?.activeRentals || 14}</div>
              <span className="text-[10px] text-muted-foreground">Live on road</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Fleet Utilization</span>
              <div className="font-display font-bold text-xl text-foreground num">{metrics?.utilization || 72}%</div>
              <span className="text-[10px] text-success font-medium">Optimal range</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Available Units</span>
              <div className="font-display font-bold text-xl text-foreground num">{metrics?.available || 18}</div>
              <span className="text-[10px] text-muted-foreground">Ready for booking</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">In Maintenance</span>
              <div className="font-display font-bold text-xl text-destructive num">{metrics?.inMaintenance || 3}</div>
              <span className="text-[10px] text-destructive font-medium">Service bay</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Pending Payments</span>
              <div className="font-display font-bold text-xl text-foreground num">{metrics?.pendingPayments || 2}</div>
              <span className="text-[10px] text-muted-foreground">Awaiting clearance</span>
            </div>
          </div>

          {/* Analytics Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Revenue Chart */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-semibold text-base text-foreground">Monthly Fleet Revenue Trend</h3>
                <span className="text-xs text-muted-foreground">INR (Thousands)</span>
              </div>
              <div className="h-64 w-full">
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
            <div className="lg:col-span-4 p-6 rounded-2xl bg-surface border border-border space-y-4">
              <div className="border-b border-border/80 pb-3">
                <h3 className="font-display font-semibold text-base text-foreground">Fleet Category Mix</h3>
              </div>
              <div className="h-56 w-full flex items-center justify-center">
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
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-foreground">Recent Fleet Reservations</h3>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/bookings">View All Reservations</Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentBookings?.slice(0, 5).map((b) => {
                    const v = vehicles?.find((veh) => veh.id === b.vehicleId);
                    return (
                      <tr key={b.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-mono font-semibold text-foreground">{b.id}</td>
                        <td className="p-3 font-semibold text-foreground">{v?.name || b.vehicleId}</td>
                        <td className="p-3 text-muted-foreground">{b.customerId}</td>
                        <td className="p-3 text-muted-foreground">{b.startDate} to {b.endDate}</td>
                        <td className="p-3 font-mono font-semibold text-primary">{inr(b.total)}</td>
                        <td className="p-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-3 text-right">
                          <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                            <Link to="/bookings/$id" params={{ id: b.id }}>Inspect</Link>
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
