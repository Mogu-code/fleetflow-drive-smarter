import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowUpDown, SlidersHorizontal } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { CardSkeleton, EmptyState } from "@/components/fleet/states";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { vehicleService } from "@/lib/services";
import type { VehicleCategory } from "@/types";
import { PresentationBar } from "@/components/fleet/presentation-bar";

const CATEGORIES: VehicleCategory[] = ["SUV", "Sedan", "Hatchback", "Luxury", "Electric", "MUV"];

export type SortOption = "featured" | "price-low" | "price-high" | "rating";

type ExploreSearch = {
  category?: VehicleCategory | undefined;
  q?: string | undefined;
  sort?: SortOption | undefined;
};

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => ({
    category: CATEGORIES.includes(search["category"] as VehicleCategory)
      ? (search["category"] as VehicleCategory)
      : undefined,
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    sort: ["featured", "price-low", "price-high", "rating"].includes(search["sort"] as SortOption)
      ? (search["sort"] as SortOption)
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore the fleet — FleetFlow" },
      {
        name: "description",
        content:
          "Filter FleetFlow's self-drive fleet by category, fuel, and price sorting. Live availability across eight Indian city hubs.",
      },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { category, q, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/explore" });
  const [currentSort, setCurrentSort] = useState<SortOption>(sort || "featured");

  const { data, isPending } = useQuery({
    queryKey: ["vehicles", category ?? "all", q ?? ""],
    queryFn: () =>
      vehicleService.list({
        ...(category ? { categories: [category] } : {}),
        ...(q ? { q } : {}),
      }),
  });

  // Apply sorting algorithm
  const sortedVehicles = React.useMemo(() => {
    if (!data) return [];
    const list = [...data];
    if (currentSort === "price-low") {
      return list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    }
    if (currentSort === "price-high") {
      return list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    }
    if (currentSort === "rating") {
      return list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [data, currentSort]);

  const handleSortChange = (newSort: SortOption) => {
    setCurrentSort(newSort);
    navigate({
      search: (prev) => ({ ...prev, sort: newSort !== "featured" ? newSort : undefined }),
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PresentationBar />
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-5 py-10 sm:px-8 space-y-8">
        <div className="border-b border-border/80 pb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>The fleet</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Explore Every Vehicle
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter by vehicle type, search location, and sort by rental pricing.
            </p>
          </div>

          {/* SORTING CONTROL DROPDOWN */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-primary" /> Sort By:
            </span>
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="rounded-xl bg-surface border border-border px-3.5 py-2 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs cursor-pointer"
            >
              <option value="featured">Featured / Recommended</option>
              <option value="price-low">Price: Low to High (₹)</option>
              <option value="price-high">Price: High to Low (₹)</option>
              <option value="rating">Customer Rating (Highest)</option>
            </select>
          </div>
        </div>

        {/* SEARCH AND CATEGORY FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border shadow-md">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              defaultValue={q ?? ""}
              placeholder="Search by vehicle model or city..."
              className="pl-9 bg-surface-2 text-xs"
              onChange={(e) => {
                const value = e.target.value;
                navigate({
                  search: (prev) => ({ ...prev, q: value || undefined }),
                  replace: true,
                });
              }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={category ? "secondary" : "default"}
              onClick={() => navigate({ search: (prev) => ({ ...prev, category: undefined }) })}
              className="text-xs"
            >
              All Types
            </Button>
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "secondary"}
                onClick={() => navigate({ search: (prev) => ({ ...prev, category: c }) })}
                className="text-xs"
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        {/* VEHICLES GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isPending
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : sortedVehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>

        {!isPending && sortedVehicles.length === 0 && (
          <EmptyState
            title="No vehicles match"
            description="Try clearing your search query or choosing a different category filter."
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
