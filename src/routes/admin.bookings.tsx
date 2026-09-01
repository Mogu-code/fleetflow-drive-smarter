import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { bookingService, vehicleService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({
    meta: [
      { title: "Fleet Reservations — Enterprise Admin" },
      {
        name: "description",
        content: "Monitor all fleet rental reservations, active contracts, and booking timelines.",
      },
    ],
  }),
  component: AdminBookings,
});

function AdminBookings() {
  const { data: bookings, isPending } = useQuery({
    queryKey: ["bookings", "admin-list"],
    queryFn: () => bookingService.listAll(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "admin-bookings"],
    queryFn: () => vehicleService.list({}),
  });

  return (
    <ProtectedRoute allowedRoles={["Manager", "Salesperson"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6">
            <Eyebrow>ENTERPRISE BOOKINGS</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              All Fleet Reservations
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Global view of confirmed, active, and completed customer rental contracts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Customer ID</th>
                    <th className="p-3">Pickup Location</th>
                    <th className="p-3">Rental Dates</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">Loading booking database...</td>
                    </tr>
                  ) : bookings?.map((b) => {
                    const v = vehicles?.find((veh) => veh.id === b.vehicleId);
                    return (
                      <tr key={b.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-foreground">{b.id}</td>
                        <td className="p-3 font-semibold text-foreground">{v?.name || b.vehicleId}</td>
                        <td className="p-3 font-mono text-muted-foreground">{b.customerId}</td>
                        <td className="p-3 text-muted-foreground">{b.pickupLocation}</td>
                        <td className="p-3 text-muted-foreground">{b.startDate} to {b.endDate}</td>
                        <td className="p-3 font-mono font-semibold text-primary">{inr(b.total)}</td>
                        <td className="p-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-3 text-right">
                          <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                            <Link to="/bookings/$id" params={{ id: b.id }}>Contract</Link>
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
