import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, RefreshCw } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { Button } from "@/components/ui/button";
import { analyticsService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/admin/health")({
  head: () => ({
    meta: [
      { title: "Fleet Health Index (91/100) — FleetFlow Admin" },
      {
        name: "description",
        content: "Dynamic calculated Fleet Health Index breakdown: Maintenance Score, Availability, Utilization, and Service Compliance.",
      },
    ],
  }),
  component: AdminHealth,
});

function AdminHealth() {
  const { data: health, isPending, refetch } = useQuery({
    queryKey: ["analytics", "health"],
    queryFn: () => analyticsService.fleetHealth(),
  });

  if (isPending || !health) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-7xl mx-auto w-full p-8">
          <div className="h-64 rounded-2xl bg-surface border border-border animate-pulse" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["Manager", "Mechanic"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div>
              <Eyebrow>ENTERPRISE QUALITY ASSURANCE</Eyebrow>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-primary" /> Dynamic Fleet Health Index
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Computed in real time from live maintenance work orders, active availability, and compliance logs.
              </p>
            </div>

            <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Recalculate Index
            </Button>
          </div>

          {/* Overall Health Score Card */}
          <div className="p-8 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Calculated Overall Fleet Score
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-6xl font-bold text-primary num">{health.overallScore}</span>
                <span className="font-display text-2xl text-muted-foreground">/ 100</span>
                <span className="ml-4 text-xs font-bold uppercase px-3 py-1 rounded-full bg-success/20 text-success border border-success/30">
                  {health.label} CONDITION
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-md">
                Score is dynamically updated whenever a booking occurs, vehicle status changes to maintenance, or service orders complete.
              </p>
            </div>

            {/* Key Count Metrics */}
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="p-4 rounded-xl bg-surface-2 border border-border/60">
                <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Total Vehicles</span>
                <span className="font-display text-xl font-bold text-foreground num">{health.metrics.totalVehicles}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-border/60">
                <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Active Rentals</span>
                <span className="font-display text-xl font-bold text-foreground num">{health.metrics.activeRentals}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-border/60">
                <span className="text-muted-foreground text-[10px] uppercase font-semibold block">In Service Bay</span>
                <span className="font-display text-xl font-bold text-destructive num">{health.metrics.inMaintenanceCount}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-border/60">
                <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Overdue Work</span>
                <span className="font-display text-xl font-bold text-destructive num">{health.metrics.overdueMaintenanceCount}</span>
              </div>
            </div>
          </div>

          {/* Sub-Score Breakdown Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Maintenance Score</span>
              <div className="font-display text-3xl font-bold text-foreground num">{health.subScores.maintenance} / 100</div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${health.subScores.maintenance}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground">Based on overdue service logs & vehicle uptime.</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Availability Score</span>
              <div className="font-display text-3xl font-bold text-foreground num">{health.subScores.availability} / 100</div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full bg-success" style={{ width: `${health.subScores.availability}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground">Based on percentage of units available vs inactive.</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utilization Score</span>
              <div className="font-display text-3xl font-bold text-foreground num">{health.subScores.utilization} / 100</div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${health.subScores.utilization}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground">Based on average daily rental utilization efficiency.</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service Compliance</span>
              <div className="font-display font-bold text-3xl text-foreground num">{health.subScores.serviceCompliance} / 100</div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${health.subScores.serviceCompliance}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground">Based on completed mechanic inspection work orders.</p>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
