import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { bookingService, vehicleService, agreementService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/bookings/$id")({
  head: () => ({
    meta: [
      { title: "Booking Details & Rental Agreement — FleetFlow" },
      {
        name: "description",
        content: "View contract agreement terms, extend rental duration, or manage booking details.",
      },
    ],
  }),
  component: BookingSingle,
});

function BookingSingle() {
  const { id } = Route.useParams();

  const [extending, setExtending] = useState(false);
  const [newEndDate, setNewEndDate] = useState("");
  const [extendedSuccess, setExtendedSuccess] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { data: booking, isPending, refetch } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingService.get(id),
  });

  const { data: vehicle } = useQuery({
    queryKey: ["vehicle", booking?.vehicleId],
    queryFn: () => vehicleService.get(booking!.vehicleId),
    enabled: !!booking,
  });

  const { data: agreement } = useQuery({
    queryKey: ["agreement", id],
    queryFn: () => agreementService.forBooking(id),
    enabled: !!booking,
  });

  if (isPending || !booking) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 max-w-7xl mx-auto w-full p-8">
          <div className="h-64 rounded-2xl bg-surface border border-border animate-pulse" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const handleExtendDuration = async () => {
    if (!newEndDate) return;
    booking.endDate = newEndDate;
    setExtendedSuccess(true);
    setExtending(false);
    refetch();
  };

  const handleCancelBooking = async () => {
    await bookingService.updateStatus(booking.id, "cancelled");
    setCancelling(false);
    refetch();
  };

  return (
    <ProtectedRoute allowedRoles={["Customer", "Salesperson", "Mechanic", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Eyebrow>BOOKING REFERENCE</Eyebrow>
                <StatusBadge status={booking.status} />
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground font-mono">
                {booking.id}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Booked on {booking.createdAt} • Pickup at {booking.pickupLocation}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {booking.status !== "cancelled" && booking.status !== "completed" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => setExtending(true)}>
                    Extend Trip Duration
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setCancelling(true)}>
                    Cancel Reservation
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Extension Dialog Modal */}
          {extending && (
            <div className="p-6 rounded-2xl bg-surface border border-primary/40 space-y-4 animate-rise">
              <h3 className="font-display font-semibold text-base text-foreground">Extend Rental Duration</h3>
              <p className="text-xs text-muted-foreground">
                Current return date: <strong className="text-foreground">{booking.endDate}</strong>. Select new return date:
              </p>
              <div className="flex gap-3 max-w-xs">
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs text-foreground"
                />
                <Button size="sm" onClick={handleExtendDuration}>
                  Confirm Extension
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setExtending(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {extendedSuccess && (
            <div className="p-4 rounded-xl bg-success/20 border border-success/40 text-success text-xs font-semibold animate-rise">
              ✓ Trip extended successfully! New return date updated to {booking.endDate}.
            </div>
          )}

          {cancelling && (
            <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/40 space-y-4 animate-rise">
              <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                <AlertTriangle className="w-5 h-5" /> Are you sure you want to cancel this booking?
              </div>
              <p className="text-xs text-muted-foreground">
                Cancelling will immediately make vehicle <strong>{vehicle?.name}</strong> available for other renters and initiate full refund to original payment source.
              </p>
              <div className="flex gap-3">
                <Button size="sm" variant="destructive" onClick={handleCancelBooking}>
                  Yes, Cancel Reservation
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCancelling(false)}>
                  Keep Reservation
                </Button>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Details & Lifecycle */}
            <div className="lg:col-span-8 space-y-6">
              {/* Vehicle Summary */}
              {vehicle && (
                <div className="p-6 rounded-2xl bg-surface border border-border flex items-center gap-6">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-32 h-20 rounded-xl object-cover border border-border"
                  />
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground">{vehicle.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <div>{vehicle.category} • Reg: <strong className="font-mono text-foreground">{vehicle.registration}</strong></div>
                      <div>Location: {vehicle.location}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lifecycle Timeline Progress */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                <h3 className="font-display font-semibold text-base text-foreground">Rental Timeline Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs text-center">
                  {booking.timeline.map((st) => (
                    <div
                      key={st.label}
                      className={`p-3 rounded-xl border ${
                        st.done
                          ? "bg-primary/20 border-primary text-primary font-semibold"
                          : "bg-surface-2 border-border/60 text-muted-foreground"
                      }`}
                    >
                      <div>{st.label}</div>
                      <div className="text-[10px] opacity-80 mt-1">{st.at || "Pending"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Rental Contract Document */}
              {agreement && (
                <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div className="flex items-center gap-2 font-display font-semibold text-sm text-foreground">
                      <FileText className="w-4 h-4 text-primary" /> Digital Rental Agreement Contract
                    </div>
                    <span className="font-mono text-muted-foreground">{agreement.id}</span>
                  </div>

                  <div className="space-y-2 text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground">Contract Terms & Standard Operating Conditions:</p>
                    <ul className="space-y-1.5 list-disc list-inside">
                      {agreement.terms.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                    <div>Digitally signed at <strong className="text-foreground">{agreement.signedAt}</strong></div>
                    <span className="text-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Legally Binding
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing & Location Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                <h3 className="font-display font-semibold text-base text-foreground border-b border-border/80 pb-3">
                  Financial Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-mono text-foreground">{inr(booking.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes (18% GST):</span>
                    <span className="font-mono text-foreground">{inr(booking.taxes)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Insurance Add-on:</span>
                    <span className="font-mono text-foreground">{inr(booking.insurance)}</span>
                  </div>
                  <div className="flex justify-between font-display font-semibold text-sm text-foreground pt-2 border-t border-border/60">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono text-primary font-bold">{inr(booking.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
