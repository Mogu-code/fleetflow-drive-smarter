import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Wrench, CheckCircle2, Search, X, Edit, Eye } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { maintenanceService, vehicleService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import type { MaintenanceRecord } from "@/types";

export const Route = createFileRoute("/admin/mechanic/history")({
  head: () => ({
    meta: [
      { title: "Complete Vehicle Service History — Mechanic Portal" },
      {
        name: "description",
        content: "Complete maintenance history ledger demonstrating Vehicle 1:N Maintenance Record weak entity relationships.",
      },
    ],
  }),
  component: MechanicHistoryPage,
});

function MechanicHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  const { data: records, isPending } = useQuery({
    queryKey: ["maintenance", "mechanic-full-history"],
    queryFn: () => maintenanceService.list(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "mechanic-history"],
    queryFn: () => vehicleService.list({}),
  });

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
    <ProtectedRoute allowedRoles={["Mechanic", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>HISTORICAL DIAGNOSTICS</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  WEAK ENTITY LOG (1:N)
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="w-7 h-7 text-primary" /> Complete Fleet Service History Ledger
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Historical record of maintenance work orders, part replacements, and technician diagnostic logs.
              </p>
            </div>

            <Button asChild size="sm" variant="outline">
              <Link to="/admin/mechanic">Return to Service Bay</Link>
            </Button>
          </div>

          {/* Educational Callout */}
          <div className="p-4 rounded-2xl bg-surface border border-border text-xs text-muted-foreground space-y-1 font-mono">
            <div className="font-bold text-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" /> DBMS Concept: Vehicle (1) ─── (N) Maintenance Record
            </div>
            <p>
              Each maintenance record depends on its parent <strong>Vehicle (V-ID)</strong> identifying foreign key. If a vehicle record is deleted, its associated weak entity maintenance records are purged automatically via cascading foreign key rules.
            </p>
          </div>

          {/* Search & Filter Controls */}
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
                <option value="all">All Service Statuses</option>
                <option value="scheduled">Scheduled / Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Service History Ledger Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground bg-surface-2">
                  <tr>
                    <th className="p-3">Record M-ID</th>
                    <th className="p-3">Vehicle V-ID</th>
                    <th className="p-3">Vehicle Model</th>
                    <th className="p-3 font-sans">Service Task</th>
                    <th className="p-3">Service Date</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Technician E-ID</th>
                    <th className="p-3 font-sans">Service Status</th>
                    <th className="p-3 text-right font-sans">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-[11px]">
                  {isPending ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground font-sans">Loading service history ledger...</td>
                    </tr>
                  ) : filteredRecords?.map((r) => {
                    const v = vehicles?.find((veh) => veh.id === r.vehicleId);
                    return (
                      <tr key={r.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-bold text-foreground">{r.id}</td>
                        <td className="p-3 font-bold text-primary">{r.vehicleId}</td>
                        <td className="p-3 font-semibold text-foreground font-sans">{v?.name || r.vehicleId}</td>
                        <td className="p-3 text-muted-foreground font-sans">{r.type}</td>
                        <td className="p-3 text-muted-foreground">{r.scheduledFor}</td>
                        <td className="p-3 font-bold text-foreground">{inr(r.cost)}</td>
                        <td className="p-3 text-purple-400 font-bold">{r.mechanicId || "E311"}</td>
                        <td className="p-3 font-sans">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="p-3 text-right font-sans">
                          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setSelectedRecord(r)}>
                            <Eye className="w-3 h-3 mr-1" /> View Log
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

        {/* MODAL: VIEW MAINTENANCE RECORD DETAILS */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-bold text-base text-foreground font-sans">Maintenance Record Log Details</h3>
                <button onClick={() => setSelectedRecord(null)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-surface-2 border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Record M-ID:</span><strong className="text-foreground font-bold">{selectedRecord.id}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Vehicle V-ID:</span><strong className="text-primary font-bold">{selectedRecord.vehicleId}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Technician E-ID:</span><strong className="text-purple-400 font-bold">{selectedRecord.mechanicId || "E311"}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service Task:</span><strong className="font-sans text-[11px]">{selectedRecord.type}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service Date:</span><strong>{selectedRecord.scheduledFor}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service Cost:</span><strong className="text-primary font-bold">{inr(selectedRecord.cost)}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span className="font-sans font-bold text-success uppercase">{selectedRecord.status}</span></div>
                {selectedRecord.notes && (
                  <div className="pt-2 border-t border-border/60 font-sans text-muted-foreground">
                    <span className="font-bold text-foreground block mb-0.5">Technician Notes:</span>
                    <p className="italic">"{selectedRecord.notes}"</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end font-sans">
                <Button size="sm" onClick={() => setSelectedRecord(null)}>Close Log</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
