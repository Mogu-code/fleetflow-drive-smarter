import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wrench, CheckCircle2, ShieldAlert, Clock, PlayCircle } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { maintenanceService, vehicleService } from "@/lib/services";
import type { MaintenanceRecord } from "@/types";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/admin/mechanic")({
  head: () => ({
    meta: [
      { title: "Mechanic Service Bay — FleetFlow" },
      {
        name: "description",
        content: "Track vehicle maintenance bay queue, diagnostic work orders, and service completion logs.",
      },
    ],
  }),
  component: MechanicPortal,
});

function MechanicPortal() {
  const { user } = useAuth();

  const { data: records, isPending, refetch } = useQuery({
    queryKey: ["maintenance", "mechanic-portal"],
    queryFn: () => maintenanceService.list(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "mechanic-portal"],
    queryFn: () => vehicleService.list({}),
  });

  const handleStartService = async (record: MaintenanceRecord) => {
    await maintenanceService.create({
      ...record,
      status: "in-progress",
    });
    refetch();
  };

  const handleCompleteService = async (record: MaintenanceRecord) => {
    // Complete maintenance work order
    await maintenanceService.create({
      ...record,
      status: "completed",
    });
    // Update vehicle status back to available in fleetStore!
    await vehicleService.updateStatus(record.vehicleId, "available");
    refetch();
  };

  return (
    <ProtectedRoute allowedRoles={["Mechanic", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="border-b border-border/80 pb-6">
            <div className="flex items-center gap-2">
              <Eyebrow>SERVICE BAY</Eyebrow>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                Lead Technician: {user?.name || "Daniel Carter"}
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Wrench className="w-7 h-7 text-primary" /> Vehicle Diagnostics & Maintenance Bay
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Work order execution, technician diagnostic logs, and service completion dispatch.
            </p>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Vehicles Due for Service</span>
              <div className="font-display font-bold text-2xl text-foreground num">4</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Overdue Vehicles</span>
              <div className="font-display font-bold text-2xl text-destructive num">
                {records?.filter((r) => r.status === "overdue").length || 1}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Active Maintenance</span>
              <div className="font-display font-bold text-2xl text-primary num">
                {records?.filter((r) => r.status === "in-progress").length || 2}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Completed This Month</span>
              <div className="font-display font-bold text-2xl text-success num">
                {records?.filter((r) => r.status === "completed").length || 5}
              </div>
            </div>
          </div>

          {/* Service Bay Queue Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-foreground">Service Bay Work Orders</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Unit ID</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Registration</th>
                    <th className="p-3">Service Task</th>
                    <th className="p-3">Scheduled Date</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Technician Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">Loading service bay queue...</td>
                    </tr>
                  ) : records?.map((r) => {
                    const v = vehicles?.find((veh) => veh.id === r.vehicleId);
                    return (
                      <tr key={r.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-foreground">{r.vehicleId}</td>
                        <td className="p-3 font-semibold text-foreground">{v?.name || r.vehicleId}</td>
                        <td className="p-3 font-mono text-muted-foreground">{v?.registration || "KA01FF9021"}</td>
                        <td className="p-3 text-muted-foreground">{r.type}</td>
                        <td className="p-3 text-muted-foreground">{r.scheduledFor}</td>
                        <td className="p-3 font-mono font-semibold text-primary">{inr(r.cost)}</td>
                        <td className="p-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="p-3 text-right">
                          {r.status === "scheduled" && (
                            <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => handleStartService(r)}>
                              <PlayCircle className="w-3.5 h-3.5" /> Start Service
                            </Button>
                          )}
                          {r.status === "in-progress" && (
                            <Button size="sm" className="h-7 text-[11px] gap-1 font-semibold" onClick={() => handleCompleteService(r)}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete Service
                            </Button>
                          )}
                          {r.status === "completed" && (
                            <span className="text-success font-semibold text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Vehicle Restored to Available
                            </span>
                          )}
                          {r.status === "overdue" && (
                            <Button size="sm" variant="destructive" className="h-7 text-[11px] gap-1" onClick={() => handleStartService(r)}>
                              Dispatch Service
                            </Button>
                          )}
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
