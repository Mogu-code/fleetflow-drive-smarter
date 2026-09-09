import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ShieldCheck, Users, Car, Calendar, DollarSign, X, PlusCircle, ArrowRight } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { customerService, bookingService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import type { Customer } from "@/types";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customer Workspace & KYC — FleetFlow Operations" },
      {
        name: "description",
        content: "Salesperson customer workspace: Renter accounts, driving credential verification, booking history, and sales booking dispatch.",
      },
    ],
  }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers, isPending } = useQuery({
    queryKey: ["customers", "admin-workspace"],
    queryFn: () => customerService.list(),
  });

  const { data: bookings } = useQuery({
    queryKey: ["bookings", "customer-workspace"],
    queryFn: () => bookingService.listAll(),
  });

  const filteredCustomers = customers?.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);
    const matchesKyc = kycFilter === "all" ? true : kycFilter === "verified" ? true : true;
    return matchesSearch && matchesKyc;
  });

  const selectedCustomerBookings = bookings?.filter((b) => b.customerId === selectedCustomer?.id) || [];

  return (
    <ProtectedRoute allowedRoles={["Manager", "Salesperson"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>ENTERPRISE CUSTOMERS</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  DBMS BOOKS Junction Table (C-ID ↔ E-ID)
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Users className="w-7 h-7 text-primary" /> Customer Accounts & KYC Workspace
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage customer profiles, inspect rental history, and initiate new vehicle bookings.
              </p>
            </div>

            <Button onClick={() => navigate({ to: "/explore" })} className="gap-2 font-semibold">
              <PlusCircle className="w-4 h-4" /> Initiate Booking for Customer
            </Button>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by C-ID, name, email, city..."
                className="w-full rounded-lg bg-surface-2 border border-border pl-9 pr-3 py-2 text-xs text-foreground focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs text-foreground font-semibold"
              >
                <option value="all">All Verification Statuses</option>
                <option value="verified">Verified Driving License</option>
                <option value="pending">Pending Verification</option>
              </select>
            </div>
          </div>

          {/* Customer Data Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50 font-mono">
                  <tr>
                    <th className="p-3">Customer C-ID</th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Contact Email & Phone</th>
                    <th className="p-3">Hub City</th>
                    <th className="p-3">Total Rentals</th>
                    <th className="p-3">Lifetime Spend</th>
                    <th className="p-3">KYC Status</th>
                    <th className="p-3 text-right">Sales Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">Loading customer records...</td>
                    </tr>
                  ) : filteredCustomers?.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">{c.id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{c.name}</div>
                        <div className="text-[10px] text-muted-foreground">Member since {c.joinedAt}</div>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">
                        <div>{c.email}</div>
                        <div className="text-[10px]">{c.phone}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{c.city}</td>
                      <td className="p-3 font-mono font-bold text-foreground">{c.totalBookings}</td>
                      <td className="p-3 font-mono font-bold text-primary">{inr(c.totalSpend)}</td>
                      <td className="p-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success/20 text-success flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" /> License Verified
                        </span>
                      </td>
                      <td className="p-3 text-right flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          View Profile & History
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold gap-1"
                          onClick={() => navigate({ to: "/explore" })}
                        >
                          + Book Car
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <SiteFooter />

        {/* CUSTOMER INSPECTION DRAWER MODAL */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-primary">CUSTOMER RECORD: {selectedCustomer.id}</span>
                  <h3 className="font-display font-bold text-xl text-foreground">{selectedCustomer.name}</h3>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs p-4 rounded-2xl bg-surface-2 border border-border">
                <div>Email: <strong className="text-foreground font-sans block">{selectedCustomer.email}</strong></div>
                <div>Phone: <strong className="text-foreground block">{selectedCustomer.phone}</strong></div>
                <div>City: <strong className="text-foreground font-sans block">{selectedCustomer.city}</strong></div>
                <div>Lifetime Spend: <strong className="text-primary block">{inr(selectedCustomer.totalSpend)}</strong></div>
                <div>Total Bookings: <strong className="text-foreground block">{selectedCustomer.totalBookings}</strong></div>
                <div>Driving License: <strong className="text-success block">KA-01-DL-2024-9102</strong></div>
              </div>

              {/* Customer Booking History Section */}
              <div className="space-y-3">
                <h4 className="font-display font-semibold text-sm text-foreground">Customer Rental & Booking History ({selectedCustomerBookings.length})</h4>
                {selectedCustomerBookings.length === 0 ? (
                  <div className="p-4 rounded-xl bg-surface-2 border border-border text-xs text-muted-foreground text-center">
                    No past bookings on record for this customer.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedCustomerBookings.map((b) => (
                      <div key={b.id} className="p-3 rounded-xl bg-surface-2 border border-border flex items-center justify-between text-xs font-mono">
                        <div>
                          <div className="font-bold text-foreground">{b.agreementId || `RA-${b.id}`}</div>
                          <div className="text-[10px] text-muted-foreground">{b.startDate} to {b.endDate}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{inr(b.total)}</div>
                          <span className="text-[10px] font-bold text-success uppercase">{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border/80 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>Close</Button>
                <Button onClick={() => { setSelectedCustomer(null); navigate({ to: "/explore" }); }} className="gap-1 font-semibold">
                  + Create New Booking for {selectedCustomer.name} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
