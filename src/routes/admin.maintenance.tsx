import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wrench, CheckCircle2, Plus, X, Search, PlayCircle } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { maintenanceService, vehicleService } from "@/lib/services";
import type { MaintenanceRecord } from "@/types";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PresentationBar } from "@/components/fleet/presentation-bar";

export const Route = createFileRoute("/admin/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance & Diagnostics Hub — FleetFlow" },
      {
        name: "description",
        content: "Track vehicle health work orders, mechanics logs, servicing schedules, and overdue alerts.",
      },
    ],
  }),
  component: AdminMaintenance,
});

function AdminMaintenance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("V101");
  const [serviceType, setServiceType] = useState("Brake & Suspension Overhaul");
  const [estimatedCost, setEstimatedCost] = useState(4500);
  const [notes, setNotes] = useState("Inspected brake pads, engine oil levels, and tyre pressures.");

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
      notes,
    });
    // Set vehicle status to maintenance in central store
    await vehicleService.updateStatus(selectedVehicleId, "maintenance");
    setIsModalOpen(false);
    refetch();
  };

  const handleStartWorkOrder = async (record: MaintenanceRecord) => {
    await maintenanceService.create({
      ...record,
      status: "in-progress",
    });
    await vehicleService.updateStatus(record.vehicleId, "maintenance");
    refetch();
  };

  const handleCompleteWorkOrder = async (record: MaintenanceRecord) => {
    await maintenanceService.create({
      ...record,
      status: "completed",
    });
    // Restore vehicle status back to available
    await vehicleService.updateStatus(record.vehicleId, "available");
    refetch();
  };

  const filteredRecords = records?.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      r.id.toLowerCase().includes(q) ||
      r.vehicleId.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={["Manager", "Mechanic"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>FLEET RELIABILITY</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Maintenance Record Weak Entity (M-ID, V-ID)
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Wrench className="w-7 h-7 text-primary" /> Maintenance & Diagnostics Hub
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Work order dispatch, scheduled diagnostics, and technician diagnostic log compliance.
              </p>
            </div>

            <Button onClick={() => setIsModalOpen(true)} className="gap-2 font-semibold">
              <Plus className="w-4 h-4" /> Create Work Order
            </Button>
          </div>

          {/* Search & Status Filter Bar */}
          <div className="p-4 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by M-ID, V-ID, Task..."
                className="w-full rounded-lg bg-surface-2 border border-border pl-9 pr-3 py-2 text-xs text-foreground focus:outline-hidden font-mono"
              />
            </div>

            <div className="flex gap-2 font-semibold text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
              >
                <option value="all">All Work Order Statuses</option>
                <option value="scheduled">Scheduled / Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Maintenance Alert Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
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
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Completed</span>
              <div className="font-display font-bold text-2xl text-success num">
                {records?.filter((r) => r.status === "completed").length || 0}
              </div>
            </div>
          </div>

          {/* Work Orders Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="font-display font-semibold text-lg text-foreground">Active Work Orders & Logs</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">M-ID Ref</th>
                    <th className="p-3">V-ID Vehicle</th>
                    <th className="p-3 font-sans">Service Task</th>
                    <th className="p-3">Mechanic E-ID</th>
                    <th className="p-3">Service Date</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3 font-sans">Status</th>
                    <th className="p-3 text-right font-sans">Technician Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground font-sans">Loading service bay queue...</td>
                    </tr>
                  ) : filteredRecords?.map((r) => {
                    const v = vehicles?.find((veh) => veh.id === r.vehicleId);
                    return (
                      <tr key={r.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-bold text-foreground">{r.id}</td>
                        <td className="p-3 font-bold text-primary">
                          {r.vehicleId} <span className="font-sans text-[11px] text-muted-foreground">({v?.name || "Vehicle"})</span>
                        </td>
                        <td className="p-3 font-sans font-semibold text-foreground">{r.type}</td>
                        <td className="p-3 text-purple-400 font-bold">{r.mechanicId || "E311"}</td>
                        <td className="p-3 text-muted-foreground">{r.scheduledFor}</td>
                        <td className="p-3 font-bold text-foreground">{inr(r.cost)}</td>
                        <td className="p-3 font-sans">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="p-3 text-right font-sans">
                          {r.status === "scheduled" && (
                            <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => handleStartWorkOrder(r)}>
                              <PlayCircle className="w-3.5 h-3.5" /> Start Service
                            </Button>
                          )}
                          {r.status === "in-progress" && (
                            <Button size="sm" className="h-7 text-[11px] gap-1 font-semibold" onClick={() => handleCompleteWorkOrder(r)}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete Service
                            </Button>
                          )}
                          {r.status === "completed" && (
                            <span className="text-success font-semibold text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Restored to Available
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
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-semibold text-base text-foreground">Dispatch Maintenance Work Order</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWorkOrder} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="font-semibold text-muted-foreground uppercase block mb-1">Select Vehicle V-ID</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-sans"
                  >
                    {vehicles?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.id} — {v.name} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground uppercase block mb-1">Service Task Description</label>
                  <input
                    type="text"
                    required
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-sans"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground uppercase block mb-1">Estimated Repair Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground uppercase block mb-1">Technician Diagnostic Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-sans"
                  />
                </div>

                <div className="pt-3 border-t border-border/80 flex justify-end gap-2 font-sans">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="font-semibold">
                    Dispatch Order & Flag Maintenance
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
