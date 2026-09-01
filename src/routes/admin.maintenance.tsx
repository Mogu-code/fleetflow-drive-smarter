import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wrench, CheckCircle2, Plus, X } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { maintenanceService, vehicleService } from "@/lib/services";
import type { MaintenanceRecord } from "@/types";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/admin/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance & Diagnostics Hub — FleetFlow Admin" },
      {
        name: "description",
        content: "Track vehicle health work orders, mechanics logs, servicing schedules, and overdue alerts.",
      },
    ],
  }),
  component: AdminMaintenance,
});

function AdminMaintenance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("V101");
  const [serviceType, setServiceType] = useState("Brake & Suspension Overhaul");
  const [estimatedCost, setEstimatedCost] = useState(4500);

  const { data: records, isPending, refetch } = useQuery({
    queryKey: ["maintenance", "all-admin"],
    queryFn: () => maintenanceService.list(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "all-maint"],
    queryFn: () => vehicleService.list({}),
  });

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await maintenanceService.create({
      vehicleId: selectedVehicleId,
      mechanicId: "E311",
      type: serviceType,
      cost: estimatedCost,
      status: "in-progress",
      scheduledFor: new Date().toISOString().slice(0, 10),
    });
    setIsModalOpen(false);
    refetch();
  };

  const handleCompleteWorkOrder = async (record: MaintenanceRecord) => {
    await maintenanceService.create({
      ...record,
      status: "completed",
    });
    refetch();
  };

  return (
    <ProtectedRoute allowedRoles={["Manager", "Mechanic"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div>
              <Eyebrow>FLEET RELIABILITY</Eyebrow>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Wrench className="w-7 h-7 text-primary" /> Maintenance & Service Hub
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Work order dispatch, scheduled diagnostics, and mechanic log compliance.
              </p>
            </div>

            <Button onClick={() => setIsModalOpen(true)} className="gap-2 font-semibold">
              <Plus className="w-4 h-4" /> Create Work Order
            </Button>
          </div>

          {/* Maintenance Alert Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Total Work Orders</span>
              <div className="font-display font-bold text-2xl text-foreground num">{records?.length || 0}</div>
            </div>
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Active Service Bay</span>
              <div className="font-display font-bold text-2xl text-primary num">
                {records?.filter((r) => r.status === "in-progress").length || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Overdue Diagnostics</span>
              <div className="font-display font-bold text-2xl text-destructive num">
                {records?.filter((r) => r.status === "overdue").length || 0}
              </div>
            </div>
          </div>

          {/* Work Orders Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-foreground">Active Work Orders & Logs</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Order Ref</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Service Type</th>
                    <th className="p-3">Mechanic</th>
                    <th className="p-3">Scheduled Date</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {records?.map((r) => {
                    const v = vehicles?.find((veh) => veh.id === r.vehicleId);
                    return (
                      <tr key={r.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-foreground">{r.id}</td>
                        <td className="p-3 font-semibold text-foreground">{v?.name || r.vehicleId}</td>
                        <td className="p-3 text-muted-foreground">{r.type}</td>
                        <td className="p-3 text-muted-foreground">{r.mechanicId}</td>
                        <td className="p-3 text-muted-foreground">{r.scheduledFor}</td>
                        <td className="p-3 font-mono font-semibold text-primary">{inr(r.cost)}</td>
                        <td className="p-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="p-3 text-right">
                          {r.status !== "completed" ? (
                            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleCompleteWorkOrder(r)}>
                              Complete Order
                            </Button>
                          ) : (
                            <span className="text-success font-semibold text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Resolved
                            </span>
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

        {/* Create Work Order Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-semibold text-base text-foreground">Dispatch Maintenance Work Order</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWorkOrder} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Select Vehicle</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                  >
                    {vehicles?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.id} — {v.name} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Service Task Description</label>
                  <input
                    type="text"
                    required
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Estimated Repair Cost (INR)</label>
                  <input
                    type="number"
                    required
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-mono"
                  />
                </div>

                <div className="pt-3 border-t border-border/80 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="font-semibold">
                    Dispatch Order
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
