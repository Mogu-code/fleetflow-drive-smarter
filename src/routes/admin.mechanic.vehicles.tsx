import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Car, Wrench, ShieldCheck, AlertCircle, CheckCircle2, Search, X, PlusCircle, ArrowRight, PlayCircle } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { vehicleService, maintenanceService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import type { Vehicle } from "@/types";

export const Route = createFileRoute("/admin/mechanic/vehicles")({
  head: () => ({
    meta: [
      { title: "My Assigned Vehicles — Mechanic Portal" },
      {
        name: "description",
        content: "View assigned fleet units, vehicle health status, and maintenance priorities.",
      },
    ],
  }),
  component: MechanicVehiclesPage,
});

type FilterType = "all" | "needs-attention" | "under-maintenance" | "ready";

function MechanicVehiclesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const { data: vehicles, isPending, refetch } = useQuery({
    queryKey: ["vehicles", "mechanic-assigned"],
    queryFn: () => vehicleService.list({}),
  });

  const { data: records } = useQuery({
    queryKey: ["maintenance", "mechanic-vehicle-records"],
    queryFn: () => maintenanceService.list(),
  });

  const handleStartMaintenance = async (vId: string) => {
    await vehicleService.updateStatus(vId, "maintenance");
    await maintenanceService.create({
      vehicleId: vId,
      mechanicId: "E311",
      type: "Service Bay Inspection",
      cost: 3500,
      status: "in-progress",
      scheduledFor: new Date().toISOString().slice(0, 10),
    });
    setSelectedVehicle(null);
    refetch();
  };

  const handleMarkReady = async (vId: string) => {
    await vehicleService.updateStatus(vId, "available");
    setSelectedVehicle(null);
    refetch();
  };

  const filteredVehicles = vehicles?.filter((v) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      v.id.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      v.registration.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filter === "needs-attention") return v.status === "reserved" || v.status === "inactive";
    if (filter === "under-maintenance") return v.status === "maintenance";
    if (filter === "ready") return v.status === "available";
    return true;
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
                <Eyebrow>FLEET DIAGNOSTICS</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-primary/20 text-primary">
                  MECHANIC BAY ASSIGNMENTS
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Car className="w-7 h-7 text-primary" /> My Assigned Vehicles & Maintenance Priorities
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Inspect vehicle health status, diagnostic telemetry, and maintenance readiness.
              </p>
            </div>

            <Button asChild size="sm">
              <Link to="/admin/mechanic">Return to Service Bay</Link>
            </Button>
          </div>

          {/* Search & Filter Controls */}
          <div className="p-4 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by V-ID, model, reg-no..."
                className="w-full rounded-lg bg-surface-2 border border-border pl-9 pr-3 py-2 text-xs text-foreground focus:outline-hidden font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All Vehicles" },
                { id: "ready", label: "Ready / Available" },
                { id: "under-maintenance", label: "Under Maintenance" },
                { id: "needs-attention", label: "Needs Attention" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id as FilterType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filter === t.id
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isPending ? (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground">Loading assigned vehicles...</div>
            ) : filteredVehicles?.map((v) => (
              <div key={v.id} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4 shadow-xl hover:border-primary/50 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <span className="font-mono text-xs font-bold text-primary">V-ID: {v.id}</span>
                    <StatusBadge status={v.status} />
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={v.image} alt={v.name} className="w-16 h-12 rounded object-cover border border-border" />
                    <div>
                      <h4 className="font-display font-bold text-sm text-foreground">{v.name}</h4>
                      <span className="text-xs text-muted-foreground font-mono">{v.registration}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-2/60 border border-border text-xs space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="text-foreground font-semibold">{v.category} ({v.fuel})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Odometer:</span>
                      <span className="text-foreground font-semibold">{v.odometerKm.toLocaleString("en-IN")} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span className={`font-bold ${v.status === "maintenance" ? "text-destructive font-mono" : "text-success font-mono"}`}>
                        {v.status === "maintenance" ? "HIGH PRIORITY" : "NORMAL"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/80 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedVehicle(v)} className="w-full text-xs font-semibold gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Inspect Diagnostics
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <SiteFooter />

        {/* VEHICLE INSPECTION MODAL */}
        {selectedVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-primary">VEHICLE V-ID: {selectedVehicle.id}</span>
                  <h3 className="font-display font-bold text-xl text-foreground">{selectedVehicle.name}</h3>
                </div>
                <button onClick={() => setSelectedVehicle(null)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono p-4 rounded-2xl bg-surface-2 border border-border">
                <div>Reg-No: <strong className="text-foreground block">{selectedVehicle.registration}</strong></div>
                <div>Category: <strong className="text-foreground block">{selectedVehicle.category} ({selectedVehicle.fuel})</strong></div>
                <div>Odometer: <strong className="text-foreground block">{selectedVehicle.odometerKm.toLocaleString("en-IN")} km</strong></div>
                <div>Status: <StatusBadge status={selectedVehicle.status} /></div>
              </div>

              {/* Contextual Actions */}
              <div className="space-y-2 pt-2 border-t border-border/80">
                <span className="text-xs font-semibold text-muted-foreground block uppercase">Technician Maintenance Actions</span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedVehicle.status !== "maintenance" ? (
                    <Button size="sm" variant="destructive" onClick={() => handleStartMaintenance(selectedVehicle.id)} className="gap-1.5 font-semibold">
                      <PlayCircle className="w-4 h-4" /> Start Maintenance
                    </Button>
                  ) : (
                    <Button size="sm" className="gap-1.5 font-semibold bg-success text-success-foreground" onClick={() => handleMarkReady(selectedVehicle.id)}>
                      <CheckCircle2 className="w-4 h-4" /> Mark Vehicle Ready
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setSelectedVehicle(null); navigate({ to: "/admin/mechanic/history" }); }}>
                    View Service History
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
