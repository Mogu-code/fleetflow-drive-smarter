import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wrench, CheckCircle2, ShieldAlert, Clock, PlayCircle, Car, AlertTriangle, Plus, FileText } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { maintenanceService, vehicleService } from "@/lib/services";
import type { MaintenanceRecord } from "@/types";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";
import { PresentationBar } from "@/components/fleet/presentation-bar";

export const Route = createFileRoute("/admin/mechanic")({
  head: () => ({
    meta: [
      { title: "Mechanic Service Bay — FleetFlow Operations" },
      {
        name: "description",
        content: "Technician service bay portal: Vehicle diagnostics, maintenance work orders, weak entity service logs, and fleet safety status.",
      },
    ],
  }),
  component: MechanicPortal,
});

function MechanicPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehId, setSelectedVehId] = useState("V101");
  const [taskType, setTaskType] = useState("Routine Inspection");
  const [cost, setCost] = useState(4500);
  const [desc, setDesc] = useState("Inspected brake pads, engine fluids, and tyre tread pressure.");

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
    // Mark vehicle as in maintenance
    await vehicleService.updateStatus(record.vehicleId, "maintenance");
    refetch();
  };

  const handleCompleteService = async (record: MaintenanceRecord) => {
    await maintenanceService.create({
      ...record,
      status: "completed",
    });
    // Mark vehicle back to available
    await vehicleService.updateStatus(record.vehicleId, "available");
    refetch();
  };

  const handleCreateRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await maintenanceService.create({
      id: `M-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: selectedVehId,
      mechanicId: "E311",
      type: taskType,
      scheduledFor: new Date().toISOString().slice(0, 10),
      cost: Number(cost),
      status: "in-progress",
      notes: desc,
    });
    await vehicleService.updateStatus(selectedVehId, "maintenance");
    setIsModalOpen(false);
    refetch();
  };

  return (
    <ProtectedRoute allowedRoles={["Mechanic", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          {/* Header & Mechanic ISA Attributes Banner */}
          <div className="p-6 rounded-3xl bg-surface border border-border flex flex-wrap items-center justify-between gap-6 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>SERVICE BAY WORKSPACE</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  MECHANIC E-ID: E311 • {user?.name || "Daniel Carter"}
                </span>
                <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Specialization: EV & Powertrain • Shift: Morning
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Wrench className="w-7 h-7 text-primary" /> Vehicle Diagnostics & Service Bay
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Technician diagnostic logs, maintenance work orders, and vehicle safety status.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5 font-semibold">
                <Plus className="w-4 h-4" /> Add Service Record
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/maintenance" })}>
                <Wrench className="w-4 h-4 text-primary" /> Maintenance Work Orders
              </Button>
            </div>
          </div>

          {/* Weak Entity Explanation Callout Banner */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 space-y-1">
            <div className="font-semibold flex items-center gap-2 text-foreground font-mono">
              <FileText className="w-4 h-4 text-purple-400" /> DBMS Model: Maintenance Record (Weak Entity)
            </div>
            <p className="text-muted-foreground">
              Modeled as a weak entity because a maintenance record cannot exist without an identifying <strong>Vehicle (V-ID)</strong> composite key: <span className="font-mono text-purple-300 font-bold">MaintenanceRecord (M-ID [Partial Key], V-ID [FK → Vehicle], Service-Date, Cost, Description)</span>.
            </p>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Vehicles Assigned</span>
              <div className="font-display font-bold text-2xl text-foreground num">{vehicles?.length || 8}</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Under Maintenance</span>
              <div className="font-display font-bold text-2xl text-primary num">
                {vehicles?.filter((v) => v.status === "maintenance").length || 2}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Today's Work Orders</span>
              <div className="font-display font-bold text-2xl text-warning num">3</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Completed This Month</span>
              <div className="font-display font-bold text-2xl text-success num">27</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Maintenance Cost</span>
              <div className="font-display font-bold text-lg text-foreground num">{inr(48500)}</div>
            </div>
          </div>

          {/* Service Bay Queue Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="font-display font-semibold text-lg text-foreground">Active Service Bay Work Orders</h3>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/mechanic/history">View Full Service History</Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50 font-mono">
                  <tr>
                    <th className="p-3">Record M-ID</th>
                    <th className="p-3">Vehicle V-ID</th>
                    <th className="p-3">Vehicle Model</th>
                    <th className="p-3">Service Task</th>
                    <th className="p-3">Service Date</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Technician Dispatch</th>
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
                        <td className="p-3 font-mono font-bold text-foreground">{r.id}</td>
                        <td className="p-3 font-mono text-primary font-bold">{r.vehicleId}</td>
                        <td className="p-3 font-semibold text-foreground">{v?.name || r.vehicleId}</td>
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

        {/* Modal: Create Maintenance Record */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5">
              <h3 className="font-display font-semibold text-lg text-foreground">Create Maintenance Record</h3>
              <form onSubmit={handleCreateRecordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-muted-foreground uppercase font-semibold block mb-1">Vehicle V-ID</label>
                  <select
                    value={selectedVehId}
                    onChange={(e) => setSelectedVehId(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border p-2.5 text-foreground"
                  >
                    {vehicles?.map((v) => (
                      <option key={v.id} value={v.id}>{v.id} — {v.name} ({v.registration})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-semibold block mb-1">Service Task Description</label>
                  <input
                    type="text"
                    required
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border p-2.5 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-semibold block mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full rounded-lg bg-surface-2 border border-border p-2.5 text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-semibold block mb-1">Technician Notes</label>
                  <textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border p-2.5 text-foreground"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Log Service Record</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
