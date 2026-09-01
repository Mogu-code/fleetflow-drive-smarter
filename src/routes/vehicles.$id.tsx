import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Gauge,
  Fuel,
  Settings,
  Star,
  CheckCircle2,
  MapPin,
  CalendarDays,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { addDays, format, differenceInDays } from "date-fns";
import type { DateRange } from "react-day-picker";

import { SiteHeader, SiteFooter } from "@/components/fleet/site-chrome";
import { StatusBadge } from "@/components/fleet/status-badge";
import { Eyebrow } from "@/components/fleet/brand";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { inr } from "@/lib/format";
import { vehicleService, reviewService } from "@/lib/services";
import type { Vehicle } from "@/types";

export const Route = createFileRoute("/vehicles/$id")({
  head: () => ({
    meta: [{ title: "Vehicle details — FleetFlow" }],
  }),
  component: VehicleDetail,
});

function VehicleDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate({ from: "/vehicles/$id" });

  const { data: vehicle, isPending } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => vehicleService.get(id),
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewService.forVehicle(id),
  });

  const [date, setDate] = useState<DateRange | undefined>();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-10">
          <div className="animate-pulse text-muted-foreground">Loading vehicle…</div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 p-10 mx-auto max-w-4xl">
          <h1 className="text-xl font-semibold">Vehicle not found</h1>
          <Link to="/" className="mt-3 inline-block text-sm text-primary underline">
            Back to fleet
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const duration = date?.from && date?.to ? Math.max(1, differenceInDays(date.to, date.from)) : 0;
  const estimatedTotal = duration > 0 ? duration * vehicle.pricePerDay : vehicle.pricePerDay;

  // Disabled dates matching mock unavailable dates
  const disabledDates = (d: Date) => {
    const dStr = format(d, "yyyy-MM-dd");
    return vehicle.unavailableDates.includes(dStr) || d < new Date(new Date().setHours(0, 0, 0, 0));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-7xl px-5 py-8 sm:px-8 w-full">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between animate-rise">
          <div>
            <div className="flex items-center gap-2">
              <Eyebrow>{vehicle.category}</Eyebrow>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <Eyebrow>
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" /> {vehicle.location}
                </span>
              </Eyebrow>
            </div>
            <h1 className="mt-2 text-4xl sm:text-5xl font-display font-semibold tracking-[-0.02em]">
              {vehicle.name}
            </h1>
            <div className="mt-4 flex items-center gap-4 text-sm font-medium">
              <StatusBadge status={vehicle.status} />
              <div className="flex items-center text-muted-foreground">
                <Star className="w-4 h-4 mr-1 text-primary fill-primary" />
                <span className="text-foreground">{vehicle.rating}</span>
                <span className="ml-1 font-normal">({vehicle.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Visual Gallery */}
        <div
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 h-[40vh] md:h-[60vh] animate-rise"
          style={{ animationDelay: "100ms" }}
        >
          <div className="md:col-span-2 overflow-hidden rounded-2xl">
            <img
              src={vehicle.gallery[0]}
              alt={vehicle.name}
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4">
            <div className="overflow-hidden rounded-2xl bg-surface-2 flex items-center justify-center">
              {vehicle.gallery[1] ? (
                <img
                  src={vehicle.gallery[1]}
                  alt="Gallery 2"
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
              ) : (
                <span className="text-muted-foreground text-sm font-medium">Interior View</span>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl bg-surface-2 flex items-center justify-center">
              {vehicle.gallery[2] ? (
                <img
                  src={vehicle.gallery[2]}
                  alt="Gallery 3"
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
              ) : (
                <span className="text-muted-foreground text-sm font-medium">Profile View</span>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div
          className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12 relative animate-rise"
          style={{ animationDelay: "200ms" }}
        >
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">About the vehicle</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {vehicle.description} This {vehicle.year} model ensures a premium driving
                experience. It comes fully sanitized and inspected through our comprehensive
                42-point checklist.
              </p>
            </section>

            <Separator />

            {/* Specifications Grid */}
            <section>
              <h2 className="text-2xl font-display font-semibold mb-6">Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-2 border border-border/50">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium mt-1">{vehicle.seats} Seats</span>
                  <span className="text-xs text-muted-foreground">Capacity</span>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-2 border border-border/50">
                  <Gauge className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium mt-1">{vehicle.transmission}</span>
                  <span className="text-xs text-muted-foreground">Transmission</span>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-2 border border-border/50">
                  <Fuel className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium mt-1">{vehicle.fuel}</span>
                  <span className="text-xs text-muted-foreground">Fuel type</span>
                </div>
                <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-2 border border-border/50">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium mt-1">{vehicle.mileage}</span>
                  <span className="text-xs text-muted-foreground">Efficiency</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Features */}
            <section>
              <h2 className="text-2xl font-display font-semibold mb-6">Premium Features</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {vehicle.features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Availability Calendar */}
            <section>
              <h2 className="text-2xl font-display font-semibold mb-6">Availability</h2>
              <div className="panel p-6 inline-block">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={setDate}
                  disabled={disabledDates}
                  numberOfMonths={2}
                  className="bg-transparent"
                />
              </div>
            </section>

            <Separator />

            {/* Policies */}
            <section>
              <h2 className="text-2xl font-display font-semibold mb-6">Rental Policies</h2>
              <div className="grid gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                    <Fuel className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Fuel Policy: Level to Level</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Return the vehicle with the same fuel/charge level as pickup to avoid
                      refueling charges.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Standard Insurance</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Includes basic coverage. Damage liability is capped at ₹15,000 for standard
                      incidents.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                    <Gauge className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Mileage Limit</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      250 km included per day. Additional mileage charged at ₹14/km.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold">Renter Reviews</h2>
                <div className="flex items-center text-sm font-medium">
                  <Star className="w-4 h-4 mr-1 text-primary fill-primary" />
                  {vehicle.rating}{" "}
                  <span className="text-muted-foreground ml-1 font-normal">overall</span>
                </div>
              </div>
              <div className="space-y-6">
                {reviews?.slice(0, 3).map((r) => (
                  <div key={r.id} className="panel p-6 bg-surface-2/50 border-transparent">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">{r.title}</h4>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < r.rating ? "text-primary fill-primary" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                    <p className="text-xs text-muted-foreground mt-4 opacity-60">
                      Verified Renter · {format(new Date(r.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Booking Panel */}
          <div className="relative">
            <div className="sticky top-24 panel p-6">
              <div className="flex items-end justify-between mb-6 border-b border-border/70 pb-6">
                <div>
                  <span className="num text-3xl font-semibold">{inr(vehicle.pricePerDay)}</span>
                  <span className="text-muted-foreground ml-1">/ day</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    Pickup & Return Hub
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-surface-2/50">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">{vehicle.location}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    Dates
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg border bg-surface-2/50 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Pickup</span>
                      <span className="text-sm font-medium">
                        {date?.from ? format(date.from, "MMM d, yy") : "Select"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg border bg-surface-2/50 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Return</span>
                      <span className="text-sm font-medium">
                        {date?.to ? format(date.to, "MMM d, yy") : "Select"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/70">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium text-sm">
                    {duration} {duration === 1 ? "day" : "days"}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-muted-foreground">Estimated Total</span>
                  <span className="font-semibold text-lg">{inr(estimatedTotal)}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full text-base"
                  disabled={vehicle.status !== "available"}
                  onClick={() => {
                    navigate({
                      to: "/book/$id",
                      params: { id: vehicle.id },
                      search: {
                        ...(date?.from ? { pickup: format(date.from, "yyyy-MM-dd") } : {}),
                        ...(date?.to ? { return: format(date.to, "yyyy-MM-dd") } : {}),
                      },
                    });
                  }}
                >
                  {vehicle.status === "available" ? "Reserve Vehicle" : "Currently Unavailable"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center">
                  <Info className="w-3 h-3 mr-1" /> You won't be charged yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
