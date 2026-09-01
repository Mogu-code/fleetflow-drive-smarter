import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, X } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { vehicleService } from "@/lib/services";
import { LOCATIONS } from "@/lib/mock-data";
import type { VehicleCategory, VehicleStatus, FuelType, Transmission } from "@/types";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/admin/vehicles")({
  head: () => ({
    meta: [
      { title: "Fleet Table & Vehicle Management — FleetFlow Admin" },
      {
        name: "description",
        content: "Manage operational status, register new fleet units, and update vehicle specifications in FleetFlow.",
      },
    ],
  }),
  component: AdminVehiclesTable,
});

function AdminVehiclesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

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
    queryKey: ["vehicles", "admin-table"],
    queryFn: () => vehicleService.list({}),
  });

  const handleStatusChange = async (id: string, newStatus: VehicleStatus) => {
    await vehicleService.updateStatus(id, newStatus);
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
      v.id.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    const matchesCat = categoryFilter === "All" || v.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCat;
  });

  return (
    <ProtectedRoute allowedRoles={["Manager", "Salesperson", "Mechanic"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div>
              <Eyebrow>ENTERPRISE INVENTORY</Eyebrow>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                Fleet Table & Status Management
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {vehicles ? `${vehicles.length} total units registered across hubs` : "Loading inventory..."}
              </p>
            </div>

            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 font-semibold">
              <Plus className="w-4 h-4" /> Add New Vehicle
            </Button>
          </div>

          {/* Filter Controls Bar */}
          <div className="p-4 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, name, registration..."
                  className="w-full rounded-lg bg-surface-2 border border-border pl-9 pr-3 py-2 text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs text-foreground"
              >
                <option value="All">All Statuses</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs text-foreground"
              >
                <option value="All">All Categories</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Electric">Electric</option>
                <option value="Luxury">Luxury</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
          </div>

          {/* Vehicles Data Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Unit ID</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Registration</th>
                    <th className="p-3">Hub Location</th>
                    <th className="p-3">Daily Rate</th>
                    <th className="p-3">Odometer</th>
                    <th className="p-3">Revenue</th>
                    <th className="p-3">Operational Status</th>
                    <th className="p-3 text-right">Quick Status Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">Loading vehicle records...</td>
                    </tr>
                  ) : filteredVehicles?.map((v) => (
                    <tr key={v.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-foreground">{v.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={v.image} alt={v.name} className="w-12 h-8 rounded object-cover border border-border" />
                          <div>
                            <div className="font-semibold text-foreground">{v.name}</div>
                            <div className="text-[10px] text-muted-foreground">{v.category} • {v.fuel}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">{v.registration}</td>
                      <td className="p-3 text-muted-foreground">{v.location}</td>
                      <td className="p-3 font-mono font-semibold text-primary">{inr(v.pricePerDay)}</td>
                      <td className="p-3 font-mono text-muted-foreground">{v.odometerKm.toLocaleString("en-IN")} km</td>
                      <td className="p-3 font-mono text-muted-foreground">{inr(v.revenueGenerated)}</td>
                      <td className="p-3">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={v.status}
                          onChange={(e) => handleStatusChange(v.id, e.target.value as VehicleStatus)}
                          className="rounded bg-surface-2 border border-border px-2 py-1 text-[11px] text-foreground font-medium"
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

        {/* Add New Vehicle Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-semibold text-lg text-foreground">Register New Fleet Unit</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Vehicle Display Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BMW X5 M Sport"
                      value={newVehName}
                      onChange={(e) => setNewVehName(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Category</label>
                    <select
                      value={newVehCategory}
                      onChange={(e) => setNewVehCategory(e.target.value as VehicleCategory)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                    >
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Electric">Electric</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Hatchback">Hatchback</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Registration Number</label>
                    <input
                      type="text"
                      required
                      value={newVehReg}
                      onChange={(e) => setNewVehReg(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Daily Rate (INR)</label>
                    <input
                      type="number"
                      required
                      value={newVehPrice}
                      onChange={(e) => setNewVehPrice(Number(e.target.value))}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Hub Location</label>
                    <select
                      value={newVehLocation}
                      onChange={(e) => setNewVehLocation(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                    >
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Fuel Type</label>
                    <select
                      value={newVehFuel}
                      onChange={(e) => setNewVehFuel(e.target.value as FuelType)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/80 flex justify-end gap-3">
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

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
