import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, PlusCircle, CheckCircle2, PlayCircle, XCircle, FileText, X } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { bookingService, vehicleService, customerService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import type { BookingStatus } from "@/types";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({
    meta: [
      { title: "Booking Pipeline & Reservations — FleetFlow Operations" },
      {
        name: "description",
        content: "Salesperson booking pipeline: Create reservations, process active rental agreements, and update booking statuses.",
      },
    ],
  }),
  component: AdminBookings,
});

function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Booking Form State
  const [custKey, setCustKey] = useState("C201");
  const [vehKey, setVehKey] = useState("V101");
  const [startDate, setStartDate] = useState("2026-09-05");
  const [endDate, setEndDate] = useState("2026-09-08");
  const [pickupLoc, setPickupLoc] = useState("Bengaluru — Indiranagar Hub");

  const { data: bookings, isPending, refetch } = useQuery({
    queryKey: ["bookings", "admin-pipeline"],
    queryFn: () => bookingService.listAll(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "admin-bookings-pipeline"],
    queryFn: () => vehicleService.list({}),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers", "admin-bookings-pipeline"],
    queryFn: () => customerService.list(),
  });

  const [selectedContract, setSelectedContract] = useState<any | null>(null);

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    const booking = bookings?.find((b) => b.id === id);
    await bookingService.updateStatus(id, status);
    if (booking) {
      if (status === "confirmed") {
        await vehicleService.updateStatus(booking.vehicleId, "reserved");
      } else if (status === "active") {
        await vehicleService.updateStatus(booking.vehicleId, "rented");
      } else if (status === "completed" || status === "cancelled") {
        await vehicleService.updateStatus(booking.vehicleId, "available");
      }
    }
    refetch();
  };

  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicles?.find((veh) => veh.id === vehKey);
    const dailyPrice = v?.pricePerDay || 4500;

    await bookingService.create({
      vehicleId: vehKey,
      customerId: custKey,
      pickupLocation: pickupLoc,
      dropoffLocation: pickupLoc,
      startDate,
      endDate,
      total: dailyPrice * 3,
      paymentMethod: "UPI",
    });

    // Update vehicle status to reserved
    await vehicleService.updateStatus(vehKey, "reserved");
    setIsModalOpen(false);
    refetch();
  };

  const filteredBookings = bookings?.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      b.id.toLowerCase().includes(q) ||
      b.customerId.toLowerCase().includes(q) ||
      b.vehicleId.toLowerCase().includes(q) ||
      b.pickupLocation.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" ? true : b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={["Manager", "Salesperson"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>ENTERPRISE PIPELINE</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  RENTAL AGREEMENT (RA-ID) ENTITY
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Calendar className="w-7 h-7 text-primary" /> Booking Pipeline & Reservations
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage confirmed, active, and completed rental agreements with real-time fleet propagation.
              </p>
            </div>

            <Button onClick={() => setIsModalOpen(true)} className="gap-2 font-semibold">
              <PlusCircle className="w-4 h-4" /> Prepare New Booking Contract
            </Button>
          </div>

          {/* Search & Pipeline Filter Bar */}
          <div className="p-4 rounded-2xl bg-surface border border-border space-y-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by RA-ID, C-ID, V-ID, city..."
                  className="w-full rounded-lg bg-surface-2 border border-border pl-9 pr-3 py-2 text-xs text-foreground focus:outline-hidden"
                />
              </div>

              {/* Status Pipeline Filter Tabs */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "all", label: "All Reservations" },
                  { id: "pending", label: "Pending" },
                  { id: "confirmed", label: "Confirmed" },
                  { id: "active", label: "Active Rental" },
                  { id: "completed", label: "Completed" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      statusFilter === st.id
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bookings Data Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50 font-mono">
                  <tr>
                    <th className="p-3">RA-ID Contract</th>
                    <th className="p-3">Vehicle V-ID</th>
                    <th className="p-3">Customer C-ID</th>
                    <th className="p-3">Pickup Location</th>
                    <th className="p-3">Rental Schedule</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Pipeline Status</th>
                    <th className="p-3 text-right">Desk Dispatch Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {isPending ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground font-sans">Loading booking pipeline...</td>
                    </tr>
                  ) : filteredBookings?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground font-sans">
                        No reservations found matching the search or pipeline status filter.
                      </td>
                    </tr>
                  ) : filteredBookings?.map((b) => {
                    const v = vehicles?.find((veh) => veh.id === b.vehicleId);
                    return (
                      <tr key={b.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-bold text-foreground">{b.agreementId || `RA-${b.id}`}</td>
                        <td className="p-3 font-bold text-foreground">
                          {b.vehicleId} <span className="font-sans text-[11px] text-muted-foreground">({v?.name || "Vehicle"})</span>
                        </td>
                        <td className="p-3 font-bold text-primary">{b.customerId}</td>
                        <td className="p-3 font-sans text-muted-foreground">{b.pickupLocation}</td>
                        <td className="p-3 text-muted-foreground">{b.startDate} to {b.endDate}</td>
                        <td className="p-3 font-bold text-primary">{inr(b.total)}</td>
                        <td className="p-3 font-sans">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-3 text-right flex justify-end gap-1.5 font-sans">
                          {b.status === "pending" && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] font-semibold" onClick={() => handleUpdateStatus(b.id, "confirmed")}>
                              Confirm
                            </Button>
                          )}
                          {b.status === "confirmed" && (
                            <Button size="sm" className="h-6 text-[10px] font-semibold gap-1" onClick={() => handleUpdateStatus(b.id, "active")}>
                              <PlayCircle className="w-3 h-3" /> Check In
                            </Button>
                          )}
                          {b.status === "active" && (
                            <Button size="sm" className="h-6 text-[10px] font-semibold gap-1 bg-success text-success-foreground" onClick={() => handleUpdateStatus(b.id, "completed")}>
                              <CheckCircle2 className="w-3 h-3" /> Complete
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] font-semibold text-foreground hover:text-primary underline" onClick={() => setSelectedContract(b)}>
                            Contract
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

        {/* MODAL: VIEW RENTAL AGREEMENT CONTRACT */}
        {selectedContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-bold text-base text-foreground font-sans">Rental Agreement Contract</h3>
                <button onClick={() => setSelectedContract(null)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-surface-2 border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Contract RA-ID:</span><strong className="text-foreground font-bold">{selectedContract.agreementId || `RA-${selectedContract.id}`}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Customer C-ID:</span><strong className="text-primary">{selectedContract.customerId}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Vehicle V-ID:</span><strong>{selectedContract.vehicleId}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rental Start:</span><strong>{selectedContract.startDate}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rental End:</span><strong>{selectedContract.endDate}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pickup Location:</span><strong className="font-sans text-[11px]">{selectedContract.pickupLocation}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pipeline Status:</span><span className="font-sans font-bold text-success uppercase">{selectedContract.status}</span></div>
                <div className="flex justify-between pt-2 border-t border-border/60 text-sm"><span className="text-muted-foreground font-sans">Total Rental Fee:</span><strong className="text-primary font-bold">{inr(selectedContract.total)}</strong></div>
              </div>

              <div className="pt-2 flex justify-end gap-2 font-sans">
                <Button size="sm" variant="outline" onClick={() => setSelectedContract(null)}>Close</Button>
                <Button asChild size="sm">
                  <Link to="/bookings/$id" params={{ id: selectedContract.id }}>View Full Contract Document</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PREPARE NEW BOOKING CONTRACT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-bold text-lg text-foreground">Prepare New Booking Contract</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBookingSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-muted-foreground uppercase font-semibold block mb-1">Select Customer C-ID</label>
                  <select
                    value={custKey}
                    onChange={(e) => setCustKey(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border p-2.5 text-foreground font-sans"
                  >
                    {customers?.map((c) => (
                      <option key={c.id} value={c.id}>{c.id} — {c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-semibold block mb-1">Select Vehicle V-ID</label>
                  <select
                    value={vehKey}
                    onChange={(e) => setVehKey(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border p-2.5 text-foreground font-sans"
                  >
                    {vehicles?.map((v) => (
                      <option key={v.id} value={v.id}>{v.id} — {v.name} ({inr(v.pricePerDay)}/day)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground uppercase font-semibold block mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border p-2.5 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground uppercase font-semibold block mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border p-2.5 text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground uppercase font-semibold block mb-1">Pickup Location Hub</label>
                  <input
                    type="text"
                    required
                    value={pickupLoc}
                    onChange={(e) => setPickupLoc(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border p-2.5 text-foreground font-sans"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="font-semibold">Confirm Contract & Dispatch</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
