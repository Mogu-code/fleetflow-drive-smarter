import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { customerService, bookingService, vehicleService, agreementService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Renter Portal Dashboard — FleetFlow" },
      {
        name: "description",
        content: "Manage your active vehicle rentals, booking history, driver verification status, and rental agreements on FleetFlow.",
      },
    ],
  }),
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const { user } = useAuth();

  const { data: customer } = useQuery({
    queryKey: ["customer", user?.id || "current"],
    queryFn: () => customerService.current(),
  });

  const { data: bookings } = useQuery({
    queryKey: ["bookings", "current"],
    queryFn: () => bookingService.list(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "all-dash"],
    queryFn: () => vehicleService.list({}),
  });

  const activeBooking = bookings?.find((b) => b.status === "confirmed" || b.status === "active");
  const activeVehicle = vehicles?.find((v) => v.id === activeBooking?.vehicleId);

  return (
    <ProtectedRoute allowedRoles={["Customer", "Salesperson", "Mechanic", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          {/* Header Profile Section */}
          <div className="p-6 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border border-primary/30 font-display text-xl font-bold flex items-center justify-center">
                {user?.avatarLabel || "MG"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-semibold text-2xl text-foreground">
                    Good morning, {user?.firstName || "Aviskha"}.
                  </h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success/20 text-success flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> License Verified
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {user?.email} • {user?.city || "Bengaluru"} Hub Renter
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-medium">
              <div className="p-3 rounded-xl bg-surface-2 border border-border/60">
                <span className="text-muted-foreground uppercase text-[10px] block font-semibold">Total Bookings</span>
                <span className="font-display text-lg font-bold text-foreground num">{customer?.totalBookings || 4}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-2 border border-border/60">
                <span className="text-muted-foreground uppercase text-[10px] block font-semibold">Lifetime Spend</span>
                <span className="font-display text-lg font-bold text-primary num">{inr(customer?.totalSpend || 28400)}</span>
              </div>
            </div>
          </div>

          {/* Active Rental Highlight Box */}
          {activeBooking && activeVehicle ? (
            <div className="p-6 rounded-2xl bg-surface border border-primary/40 space-y-6 shadow-2xl animate-rise">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-display font-semibold text-base text-foreground uppercase tracking-wider">YOUR NEXT JOURNEY</span>
                  <span className="text-xs font-mono text-muted-foreground">({activeBooking.id})</span>
                </div>
                <StatusBadge status={activeBooking.status} />
              </div>

              <div className="grid gap-6 md:grid-cols-12 items-center">
                <div className="md:col-span-4 flex items-center gap-4">
                  <img
                    src={activeVehicle.image}
                    alt={activeVehicle.name}
                    className="w-24 h-16 rounded-xl object-cover border border-border"
                  />
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground">{activeVehicle.name}</h3>
                    <p className="text-xs text-muted-foreground">{activeVehicle.category} • Reg: {activeVehicle.registration}</p>
                  </div>
                </div>

                {/* Lifecycle Timeline */}
                <div className="md:col-span-8 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Rental Progress Timeline
                  </div>
                  <div className="grid grid-cols-6 gap-1 text-[11px] text-center font-semibold">
                    {activeBooking.timeline.map((step) => (
                      <div
                        key={step.label}
                        className={`p-2 rounded-lg border ${
                          step.done
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-surface-2 border-border/60 text-muted-foreground"
                        }`}
                      >
                        <div>{step.label}</div>
                        {step.at && <div className="text-[9px] text-muted-foreground mt-0.5">{step.at}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/80 flex flex-wrap gap-3">
                <Button asChild size="sm" className="gap-2">
                  <Link to="/bookings/$id" params={{ id: activeBooking.id }}>
                    Manage Active Rental <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-surface border border-border text-center space-y-3">
              <Car className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="font-display font-semibold text-base text-foreground">No active rental right now</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Ready for your next journey? Browse our active fleet inventory with guaranteed availability.
              </p>
              <Button asChild size="sm" className="gap-2">
                <Link to="/explore">
                  Reserve a Car <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          )}

          {/* All Bookings Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-foreground">Recent Rentals & Contracts</h3>
              <Button asChild size="sm" variant="outline">
                <Link to="/bookings">View All ({bookings?.length || 0})</Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Booking Ref</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Pickup Location</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {bookings?.slice(0, 5).map((b) => {
                    const v = vehicles?.find((veh) => veh.id === b.vehicleId);
                    return (
                      <tr key={b.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-mono font-semibold text-foreground">{b.id}</td>
                        <td className="p-3 font-semibold text-foreground">{v?.name || b.vehicleId}</td>
                        <td className="p-3 text-muted-foreground">{b.startDate} to {b.endDate}</td>
                        <td className="p-3 text-muted-foreground">{b.pickupLocation}</td>
                        <td className="p-3 font-mono font-semibold text-primary">{inr(b.total)}</td>
                        <td className="p-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-3 text-right">
                          <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                            <Link to="/bookings/$id" params={{ id: b.id }}>Details</Link>
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
      </div>
    </ProtectedRoute>
  );
}
