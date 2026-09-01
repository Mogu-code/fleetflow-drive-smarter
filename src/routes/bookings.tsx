import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ArrowRight, Clock, CheckCircle2, ShieldCheck, XCircle, RotateCcw } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { bookingService, vehicleService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings & Rental History — FleetFlow" },
      {
        name: "description",
        content: "Your journeys, all in one place. Track upcoming, active, completed, and cancelled reservations.",
      },
    ],
  }),
  component: BookingsList,
});

type BookingTab = "upcoming" | "active" | "completed" | "cancelled";

function BookingsList() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");

  const { data: bookings, isPending } = useQuery({
    queryKey: ["bookings", "list-user", user?.id],
    queryFn: () => bookingService.list(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "all-bookings-list"],
    queryFn: () => vehicleService.list({}),
  });

  const filteredBookings = bookings?.filter((b) => {
    if (activeTab === "upcoming") return b.status === "confirmed";
    if (activeTab === "active") return b.status === "active";
    if (activeTab === "completed") return b.status === "completed";
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={["Customer", "Salesperson", "Mechanic", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Eyebrow>RENTER PORTAL</Eyebrow>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                MY BOOKINGS
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your journeys, all in one place.
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/explore">Reserve New Car</Link>
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-border/80 gap-2 text-xs font-semibold">
            {[
              { id: "upcoming", label: "Upcoming", count: bookings?.filter((b) => b.status === "confirmed").length },
              { id: "active", label: "Active", count: bookings?.filter((b) => b.status === "active").length },
              { id: "completed", label: "Completed", count: bookings?.filter((b) => b.status === "completed").length },
              { id: "cancelled", label: "Cancelled", count: bookings?.filter((b) => b.status === "cancelled").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as BookingTab)}
                className={`pb-3 px-4 transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-2 text-[10px] font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Grid */}
          {isPending ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading your reservations...</div>
          ) : !filteredBookings || filteredBookings.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface border border-border text-center space-y-3">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="font-display font-semibold text-base text-foreground">No {activeTab} bookings found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No reservation history currently matches this category.
              </p>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link to="/explore">Explore Fleet</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBookings.map((b) => {
                const v = vehicles?.find((veh) => veh.id === b.vehicleId);
                return (
                  <div key={b.id} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between hover:border-primary/50 transition-colors shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm text-foreground">{b.id}</span>
                        <StatusBadge status={b.status} />
                      </div>

                      {v && (
                        <div className="flex items-center gap-3">
                          <img src={v.image} alt={v.name} className="w-16 h-12 rounded-lg object-cover border border-border" />
                          <div>
                            <div className="font-display font-semibold text-sm text-foreground">{v.name}</div>
                            <div className="text-xs text-muted-foreground">{v.category} • {v.transmission}</div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border/60">
                        <div>Pickup: <strong className="text-foreground">{b.pickupLocation}</strong></div>
                        <div>Return: <strong className="text-foreground">{b.dropoffLocation}</strong></div>
                        <div>Dates: <strong className="text-foreground">{b.startDate} to {b.endDate}</strong></div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/80 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Total Paid:</span>
                        <span className="font-mono text-base font-bold text-primary">{inr(b.total)}</span>
                      </div>

                      {/* Card Actions per Tab */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {activeTab === "upcoming" && (
                          <>
                            <Button asChild size="sm" className="flex-1 text-xs">
                              <Link to="/bookings/$id" params={{ id: b.id }}>View Booking</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="text-xs">
                              <Link to="/bookings/$id" params={{ id: b.id }}>Modify</Link>
                            </Button>
                          </>
                        )}

                        {activeTab === "active" && (
                          <>
                            <Button asChild size="sm" className="flex-1 text-xs">
                              <Link to="/bookings/$id" params={{ id: b.id }}>Manage Rental</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="text-xs">
                              <Link to="/bookings/$id" params={{ id: b.id }}>View Agreement</Link>
                            </Button>
                          </>
                        )}

                        {activeTab === "completed" && (
                          <>
                            <Button asChild size="sm" variant="outline" className="flex-1 text-xs">
                              <Link to="/bookings/$id" params={{ id: b.id }}>View Receipt</Link>
                            </Button>
                            <Button asChild size="sm" className="text-xs gap-1">
                              <Link to="/explore"><RotateCcw className="w-3 h-3" /> Book Again</Link>
                            </Button>
                          </>
                        )}

                        {activeTab === "cancelled" && (
                          <>
                            <Button asChild size="sm" variant="outline" className="flex-1 text-xs">
                              <Link to="/bookings/$id" params={{ id: b.id }}>View Details</Link>
                            </Button>
                            <Button asChild size="sm" className="text-xs gap-1">
                              <Link to="/explore"><RotateCcw className="w-3 h-3" /> Book Again</Link>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
