import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, X, Car, Wrench, Calendar, ShieldCheck, Eye, ArrowRight, Layers } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { vehicleService, bookingService, maintenanceService } from "@/lib/services";
import { LOCATIONS } from "@/lib/mock-data";
import type { Vehicle, VehicleCategory, VehicleStatus, FuelType, Transmission } from "@/types";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/admin/vehicles")({
  head: () => ({
    meta: [
      { title: "Fleet Inventory & Vehicle Operations — FleetFlow Manager" },
      {
        name: "description",
        content: "Authoritative Manager fleet inventory: Manage registered vehicles, lifecycle status, and relational entity linkages.",
      },
    ],
  }),
  component: AdminVehiclesTable,
});

function AdminVehiclesTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Add Vehicle Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVehName, setNewVehName] = useState("");
  const [newVehMake, setNewVehMake] = useState("BMW");
  const [newVehModel, setNewVehModel] = useState("X5 M");
  const [newVehCategory, setNewVehCategory] = useState<VehicleCategory>("SUV");
  const [newVehReg, setNewVehReg] = useState(`KA01FF${Math.floor(1000 + Math.random() * 9000)}`);
  const [newVehPrice, setNewVehPrice] = useState(5500);
  const [newVehLocation, setNewVehLocation] = useState(LOCATIONS[0]!);
  const [newVehSeats, setNewVehSeats] = useState(5);
  const [newVehFuel, setNewVehFuel] = useState<FuelType>("Petrol");
  const [newVehTrans, setNewVehTrans] = useState<Transmission>("Automatic");

  const { data: vehicles, isPending, refetch } = useQuery({
    queryKey: ["vehicles", "manager-authoritative-list"],
    queryFn: () => vehicleService.list({}),
  });

  const { data: bookings } = useQuery({
    queryKey: ["bookings", "vehicle-relational-link"],
    queryFn: () => bookingService.listAll(),
  });

  const { data: maintenance } = useQuery({
    queryKey: ["maintenance", "vehicle-relational-link"],
    queryFn: () => maintenanceService.list(),
  });

  const handleStatusChange = async (id: string, newStatus: VehicleStatus) => {
    await vehicleService.updateStatus(id, newStatus);
    if (selectedVehicle && selectedVehicle.id === id) {
      setSelectedVehicle({ ...selectedVehicle, status: newStatus });
    }
    refetch();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehName.trim()) return;

    await vehicleService.create({
      name: newVehName,
      make: newVehMake,
      model: newVehModel,
      year: 2025,
      category: newVehCategory,
      registration: newVehReg,
      pricePerDay: newVehPrice,
      location: newVehLocation,
      seats: newVehSeats,
      fuel: newVehFuel,
      transmission: newVehTrans,
      mileage: newVehFuel === "Electric" ? "420 km range" : "14 km/l",
      status: "available",
      rating: 5.0,
      reviewCount: 1,
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200",
      gallery: [],
      features: ["Leather Upholstery", "Panoramicroof", "Apple CarPlay", "Adaptive Cruise"],
      description: `Newly registered ${newVehName} added to the operational fleet inventory.`,
      odometerKm: 450,
      lastServiceDate: new Date().toISOString().slice(0, 10),
      nextServiceDate: new Date(Date.now() + 86400000 * 90).toISOString().slice(0, 10),
      unavailableDates: [],
      utilization: 10,
      revenueGenerated: 0,
    });

    setIsAddModalOpen(false);
    setNewVehName("");
    refetch();
  };

  const filteredVehicles = vehicles?.filter((v) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      v.name.toLowerCase().includes(q) ||
      v.registration.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    const matchesCat = categoryFilter === "All" || v.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCat;
  });

  // Calculate real derived stats from shared dataset
  const totalFleetCount = vehicles?.length || 0;
  const availableCount = vehicles?.filter((v) => v.status === "available").length || 0;
  const rentedCount = vehicles?.filter((v) => v.status === "rented").length || 0;
  const maintenanceCount = vehicles?.filter((v) => v.status === "maintenance").length || 0;
  const reservedCount = vehicles?.filter((v) => v.status === "reserved" || v.status === "inactive").length || 0;

  // Selected Vehicle Relational Records
  const vehicleBookings = bookings?.filter((b) => b.vehicleId === selectedVehicle?.id) || [];
  const vehicleMaintenance = maintenance?.filter((m) => m.vehicleId === selectedVehicle?.id) || [];

  return (
    <ProtectedRoute allowedRoles={["Manager", "Salesperson", "Mechanic"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col min-w-0 overflow-x-hidden">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8 min-w-0 box-border">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>FLEET INVENTORY</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  VEHICLE ENTITY • V-ID (PK)
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Car className="w-7 h-7 text-primary" /> Fleet Inventory & Vehicle Operations
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage registered vehicles, availability, lifecycle status, and fleet readiness.
              </p>
            </div>

            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 font-semibold">
              <Plus className="w-4 h-4" /> Add Vehicle
            </Button>
          </div>

          {/* Derived Fleet Summary Metrics */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Total Fleet Units</span>
              <div className="font-display font-bold text-2xl text-foreground num">{totalFleetCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Available</span>
              <div className="font-display font-bold text-2xl text-success num">{availableCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Currently Rented</span>
              <div className="font-display font-bold text-2xl text-primary num">{rentedCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">In Maintenance</span>
              <div className="font-display font-bold text-2xl text-destructive num">{maintenanceCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Reserved / Inactive</span>
              <div className="font-display font-bold text-2xl text-warning num">{reservedCount}</div>
            </div>
          </div>

          {/* Search & Filter Controls Bar */}
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

            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
              >
                <option value="All">All Vehicle Statuses</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
              >
                <option value="All">All Vehicle Categories</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Electric">Electric</option>
                <option value="Luxury">Luxury</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
          </div>

          {/* Vehicles Relational Data Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">V-ID (PK)</th>
                    <th className="p-3 font-sans">Vehicle Model</th>
                    <th className="p-3">Registration No.</th>
                    <th className="p-3 font-sans">Category</th>
                    <th className="p-3 font-sans">Fuel Type</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3">Daily Rate</th>
                    <th className="p-3 font-sans">Status</th>
                    <th className="p-3 text-right font-sans">Manager Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground font-sans">Loading fleet records...</td>
                    </tr>
                  ) : filteredVehicles?.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground font-sans">
                        No fleet vehicles match the search or selected filters.
                      </td>
                    </tr>
                  ) : filteredVehicles?.map((v) => (
                    <tr key={v.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3 font-bold text-primary">{v.id}</td>
                      <td className="p-3 font-sans">
                        <div className="flex items-center gap-3">
                          <img src={v.image} alt={v.name} className="w-10 h-7 rounded object-cover border border-border" />
                          <div>
                            <div className="font-semibold text-foreground">{v.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{v.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{v.registration}</td>
                      <td className="p-3 font-sans text-muted-foreground">{v.category}</td>
                      <td className="p-3 font-sans text-muted-foreground">{v.fuel}</td>
                      <td className="p-3 text-muted-foreground">{v.seats} Seats</td>
                      <td className="p-3 font-bold text-foreground">{inr(v.pricePerDay)}</td>
                      <td className="p-3 font-sans">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="p-3 text-right font-sans flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] font-semibold" onClick={() => setSelectedVehicle(v)}>
                          <Eye className="w-3 h-3 mr-1" /> Inspect & Manage
                        </Button>
                        <select
                          value={v.status}
                          onChange={(e) => handleStatusChange(v.id, e.target.value as VehicleStatus)}
                          className="rounded bg-surface-2 border border-border px-2 py-0.5 text-[10px] text-foreground font-semibold"
                        >
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="rented">Rented</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <SiteFooter />

        {/* MODAL: INTERACTIVE VEHICLE RELATIONAL ENTITY DETAIL */}
        {selectedVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-primary">VEHICLE ENTITY (PK: {selectedVehicle.id})</span>
                  <h3 className="font-display font-bold text-xl text-foreground">{selectedVehicle.name}</h3>
                </div>
                <button onClick={() => setSelectedVehicle(null)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Vehicle Identity Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs p-4 rounded-2xl bg-surface-2 border border-border">
                <div>Reg-No: <strong className="text-foreground block">{selectedVehicle.registration}</strong></div>
                <div>Category: <strong className="text-foreground font-sans block">{selectedVehicle.category} ({selectedVehicle.fuel})</strong></div>
                <div>Capacity: <strong className="text-foreground block">{selectedVehicle.seats} Passengers</strong></div>
                <div>Daily Rate: <strong className="text-primary block">{inr(selectedVehicle.pricePerDay)}</strong></div>
                <div>Odometer: <strong className="text-foreground block">{selectedVehicle.odometerKm.toLocaleString("en-IN")} km</strong></div>
                <div>Status: <StatusBadge status={selectedVehicle.status} /></div>
              </div>

              {/* DBMS Relational Entity Linkages Showcase */}
              <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-3 font-mono text-xs">
                <div className="font-bold text-foreground flex items-center gap-1.5 font-sans">
                  <Layers className="w-4 h-4 text-primary" /> Relational Entity Linkages
                </div>

                {/* Rental Agreements Linkage */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">RENTAL AGREEMENT (RA-ID FK → Vehicle):</span>
                  {vehicleBookings.length === 0 ? (
                    <div className="text-muted-foreground text-[11px] font-sans italic">No active contracts linked to this vehicle.</div>
                  ) : (
                    vehicleBookings.map((b) => (
                      <div key={b.id} className="p-2 rounded-lg bg-surface border border-border flex justify-between items-center text-[11px]">
                        <span>Contract {b.agreementId || `RA-${b.id}`} • Customer {b.customerId}</span>
                        <span className="font-bold text-primary">{b.startDate} to {b.endDate}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Maintenance Records Linkage */}
                <div className="space-y-1 pt-2 border-t border-border/60">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">MAINTENANCE RECORD (M-ID FK → Vehicle):</span>
                  {vehicleMaintenance.length === 0 ? (
                    <div className="text-muted-foreground text-[11px] font-sans italic">No active service records for this vehicle.</div>
                  ) : (
                    vehicleMaintenance.map((m) => (
                      <div key={m.id} className="p-2 rounded-lg bg-surface border border-border flex justify-between items-center text-[11px]">
                        <span>Record {m.id} • {m.type}</span>
                        <span className="font-bold text-destructive">{inr(m.cost)} ({m.status})</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border/80 flex justify-end gap-2 font-sans">
                <Button variant="outline" onClick={() => setSelectedVehicle(null)}>Close</Button>
                <Button onClick={() => { setSelectedVehicle(null); navigate({ to: "/admin/bookings" }); }} className="gap-1 font-semibold">
                  View Bookings Pipeline <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: REGISTER NEW FLEET UNIT */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-bold text-lg text-foreground">Register New Fleet Unit</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-muted-foreground uppercase block mb-1">Vehicle Display Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BMW X5 M Sport"
                      value={newVehName}
                      onChange={(e) => setNewVehName(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground uppercase block mb-1">Category</label>
                    <select
                      value={newVehCategory}
                      onChange={(e) => setNewVehCategory(e.target.value as VehicleCategory)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-sans"
                    >
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Electric">Electric</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Hatchback">Hatchback</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground uppercase block mb-1">Registration Number</label>
                    <input
                      type="text"
                      required
                      value={newVehReg}
                      onChange={(e) => setNewVehReg(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground uppercase block mb-1">Daily Rate (₹)</label>
                    <input
                      type="number"
                      required
                      value={newVehPrice}
                      onChange={(e) => setNewVehPrice(Number(e.target.value))}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground uppercase block mb-1">Hub Location</label>
                    <select
                      value={newVehLocation}
                      onChange={(e) => setNewVehLocation(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-sans"
                    >
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground uppercase block mb-1">Fuel Type</label>
                    <select
                      value={newVehFuel}
                      onChange={(e) => setNewVehFuel(e.target.value as FuelType)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-sans"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/80 flex justify-end gap-2 font-sans">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="font-semibold">
                    Register Unit to Fleet
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
