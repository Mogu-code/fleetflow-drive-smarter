import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Car,
  Search,
  Calendar,
  ShieldCheck,
  Sparkles,
  Database,
  ArrowRight,
  CheckCircle2,
  Wrench,
  Activity,
  Layers,
  FileCode2,
} from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { Button } from "@/components/ui/button";
import { vehicleService } from "@/lib/services";
import { PresentationBar } from "@/components/fleet/presentation-bar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FleetFlow — Intelligent Self-Drive Vehicle Rental & Fleet Management" },
      {
        name: "description",
        content: "Intelligent vehicle rental and fleet management platform powered by real-time telemetry and relational mock data.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();

  const [pickupCity, setPickupCity] = useState("Bengaluru — Indiranagar Hub");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: vehicles, isPending } = useQuery({
    queryKey: ["vehicles", "homepage"],
    queryFn: () => vehicleService.list({}),
  });

  const CATEGORIES = ["All", "SUV", "Sedan", "Electric", "Luxury", "Hatchback", "MUV"];

  const filteredVehicles = vehicles?.filter((v) => {
    if (selectedCategory === "All") return true;
    return v.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/explore",
      search: {
        location: pickupCity,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PresentationBar />
      <SiteHeader />

      <main className="flex-1 space-y-16 pb-16">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-8 border-b border-border/60 bg-linear-to-b from-surface via-background to-background">
          <div className="mx-auto max-w-7xl grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Intelligent Self-Drive & Fleet Mobility
              </div>

              <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                Drive Smarter with <span className="text-primary underline decoration-primary/30">FleetFlow</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Experience luxury self-drive vehicle rentals backed by an operational relational database. Seamless reservation workflows, real-time telemetry, and automated maintenance diagnostics.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild size="lg" className="gap-2 font-semibold">
                  <Link to="/explore">
                    Explore Vehicles <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link to="/database/er-diagram">
                    <Database className="w-4 h-4 text-primary" /> DBMS Case Study Visualizer
                  </Link>
                </Button>
              </div>

              {/* Badges */}
              <div className="pt-6 border-t border-border/80 flex flex-wrap gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Verified Relational Schema
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" /> ACID Transaction Safeguards
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Multi-Role Access Control
                </div>
              </div>
            </div>

            {/* Right Hero Image Treatment */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-surface group">
                <img
                  src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200"
                  alt="Luxury Fleet"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>BMW X5 xDrive40i</span>
                    <span className="font-mono text-primary font-bold">₹7,800/day</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Available at Bengaluru Indiranagar Hub • 91/100 Telemetry Score
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH / AVAILABILITY WIDGET */}
        <section className="mx-auto max-w-7xl px-4 sm:px-8 -mt-8 relative z-20">
          <form
            onSubmit={handleSearchSubmit}
            className="p-6 rounded-3xl bg-surface border border-border shadow-2xl space-y-4"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" /> Check Real-Time Vehicle Availability
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1">
                  Pickup Location
                </label>
                <select
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  className="w-full rounded-xl bg-surface-2 border border-border px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="Bengaluru — Indiranagar Hub">Bengaluru — Indiranagar Hub</option>
                  <option value="Bengaluru — Koramangala Hub">Bengaluru — Koramangala Hub</option>
                  <option value="Mumbai — BKC Hub">Mumbai — BKC Hub</option>
                  <option value="Delhi — Aerocity Hub">Delhi — Aerocity Hub</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full rounded-xl bg-surface-2 border border-border px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full rounded-xl bg-surface-2 border border-border px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" className="w-full gap-2 font-semibold">
                  <Search className="w-4 h-4" /> Find Available Cars
                </Button>
              </div>
            </div>
          </form>
        </section>

        {/* FEATURED VEHICLES GRID */}
        <section className="mx-auto max-w-7xl px-4 sm:px-8 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <Eyebrow>CURATED INVENTORY</Eyebrow>
              <h2 className="mt-1 font-display text-3xl font-semibold text-foreground">
                Featured Rental Fleet
              </h2>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 bg-surface p-1 rounded-xl border border-border">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isPending ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading vehicle fleet...</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles?.slice(0, 6).map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}

          <div className="text-center pt-4">
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/explore">
                View Entire Fleet ({vehicles?.length || 8} Vehicles) <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ACADEMIC DBMS CASE STUDY PREVIEW CARD */}
        <section className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-surface border border-primary/40 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Database className="w-64 h-64 text-primary" />
            </div>

            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider">
                <Database className="w-3.5 h-3.5" /> Academic DBMS Case Study Foundation
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                Built on Relational Database Modeling
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FleetFlow is designed as a complete relational database demonstration. Explore the underlying ER model, relational tables, foreign key constraints, 1NF-3NF normalization stages, and ACID booking transactions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
              <Link
                to="/database/er-diagram"
                className="p-4 rounded-2xl bg-surface-2 border border-border hover:border-primary/60 transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  ER
                </div>
                <div className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  Interactive ER Diagram
                </div>
                <div className="text-xs text-muted-foreground">
                  11 Entities, Cardinalities, ISA Hierarchy & Weak Entities
                </div>
              </Link>

              <Link
                to="/database/schema"
                className="p-4 rounded-2xl bg-surface-2 border border-border hover:border-primary/60 transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  RS
                </div>
                <div className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  Relational Schema
                </div>
                <div className="text-xs text-muted-foreground">
                  Table attributes, Primary Keys, Foreign Keys & Constraints
                </div>
              </Link>

              <Link
                to="/database/sql-lab"
                className="p-4 rounded-2xl bg-surface-2 border border-border hover:border-primary/60 transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  SQL
                </div>
                <div className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  SQL Demonstration Lab
                </div>
                <div className="text-xs text-muted-foreground">
                  Simulated SELECT, JOINs, Aggregations & Query Execution
                </div>
              </Link>

              <Link
                to="/database/transactions"
                className="p-4 rounded-2xl bg-surface-2 border border-border hover:border-primary/60 transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  Txn
                </div>
                <div className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  ACID Transactions
                </div>
                <div className="text-xs text-muted-foreground">
                  Simulated Booking Workflow, COMMIT & ROLLBACK Safeguards
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* HOW FLEETFLOW WORKS */}
        <section className="mx-auto max-w-7xl px-4 sm:px-8 space-y-8">
          <div className="text-center space-y-2">
            <Eyebrow>SEAMLESS RENTAL FLOW</Eyebrow>
            <h2 className="font-display text-3xl font-semibold text-foreground">
              How FleetFlow Self-Drive Works
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Select Vehicle", desc: "Browse real-time available SUVs, Sedans, and EVs with full specs." },
              { step: "02", title: "Reserve Dates", desc: "Choose rental window with dynamic daily rate calculation." },
              { step: "03", title: "Verify License", desc: "Automated OCR license extraction & KYC document verification." },
              { step: "04", title: "Unlock & Drive", desc: "Digital rental agreement generated with instant keyless pickup." },
            ].map((st) => (
              <div key={st.step} className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <span className="font-mono text-2xl font-bold text-primary">{st.step}</span>
                <h3 className="font-display font-semibold text-base text-foreground">{st.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
