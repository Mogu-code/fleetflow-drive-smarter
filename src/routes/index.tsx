import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";

import heroVehicle from "@/assets/hero-vehicle.jpg";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { CardSkeleton } from "@/components/fleet/states";
import { Button } from "@/components/ui/button";
import { IMAGES, LOCATIONS, testimonials } from "@/lib/mock-data";
import { vehicleService } from "@/lib/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FleetFlow — Premium self-drive car rentals in India" },
      {
        name: "description",
        content:
          "Rent SUVs, sedans, EVs and luxury cars from FleetFlow hubs across India. Transparent pricing, instant availability and a fleet console built for operators.",
      },
      { property: "og:title", content: "FleetFlow — Premium self-drive car rentals" },
      {
        property: "og:description",
        content:
          "Book premium self-drive vehicles across eight Indian city hubs with transparent daily pricing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const CATEGORIES = ["SUV", "Sedan", "Electric", "Luxury", "Hatchback", "MUV"] as const;

function Home() {
  const { data: featured, isPending } = useQuery({
    queryKey: ["vehicles", "featured"],
    queryFn: () => vehicleService.featured(),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/70">
          <img
            src={heroVehicle}
            alt="Premium SUV parked under city lights"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/85 to-background/20" />
          <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
            <div className="max-w-2xl animate-rise">
              <Eyebrow>Self-drive · 8 city hubs</Eyebrow>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
                The fleet behind your
                <span className="text-primary"> next drive.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                Twenty meticulously maintained vehicles, live availability, and pricing that never
                moves after checkout. Book in under two minutes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/explore">
                    Explore the fleet <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/explore" search={{ category: "Electric" }}>
                    See electric picks
                  </Link>
                </Button>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
                {[
                  ["20+", "Vehicles ready"],
                  ["4.7★", "Average rating"],
                  ["8", "City hubs"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="num text-2xl font-semibold">{v}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Eyebrow>Browse by category</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em]">
            Pick the shape of your trip
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to="/explore"
                search={{ category: c }}
                className="group panel relative overflow-hidden"
              >
                <img
                  src={IMAGES[c]}
                  alt={`${c} rental vehicles`}
                  loading="lazy"
                  className="h-44 w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="font-display text-lg font-semibold">{c}</span>
                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="border-y border-border/70 bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Available now</Eyebrow>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em]">
                  Featured vehicles
                </h2>
              </div>
              <Button asChild variant="ghost">
                <Link to="/explore">
                  View all <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {isPending
                ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                : featured?.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Serviced before every handover",
                body: "Each vehicle passes a 42-point inspection and a documented fuel and odometer reading.",
              },
              {
                icon: Sparkles,
                title: "Pricing that stays put",
                body: "The daily rate you see includes taxes and standard insurance. No surge, no counter upsell.",
              },
              {
                icon: MapPin,
                title: "Hubs where you land",
                body: `Pick up in ${LOCATIONS.length} hubs including airports in Bengaluru, Delhi and Goa.`,
              },
            ].map((f) => (
              <div key={f.title} className="panel p-6">
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-border/70 bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <Eyebrow>What renters say</Eyebrow>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <figure key={t.name} className="panel p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-5 text-sm font-medium">
                    {t.name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {t.role}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
