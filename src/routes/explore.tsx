import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { CardSkeleton, EmptyState } from "@/components/fleet/states";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { vehicleService } from "@/lib/services";
import type { VehicleCategory } from "@/types";

const CATEGORIES: VehicleCategory[] = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Luxury",
  "Electric",
  "MUV",
];

type ExploreSearch = { category?: VehicleCategory; q?: string };

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => ({
    category: CATEGORIES.includes(search['category'] as VehicleCategory)
      ? (search['category'] as VehicleCategory)
      : undefined,
    q: typeof search['q'] === "string" && search['q'] ? search['q'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore the fleet — FleetFlow" },
      {
        name: "description",
        content:
          "Filter FleetFlow's self-drive fleet by category, fuel and price. Live availability across eight Indian city hubs.",
      },
      { property: "og:title", content: "Explore the fleet — FleetFlow" },
      {
        property: "og:description",
        content: "Filter self-drive vehicles by category and price with live availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { category, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/explore" });

  const { data, isPending } = useQuery({
    queryKey: ["vehicles", category ?? "all", q ?? ""],
    queryFn: () =>
      vehicleService.list({
        ...(category ? { categories: [category] } : {}),
        ...(q ? { q } : {}),
      }),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <Eyebrow>The fleet</Eyebrow>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Explore every vehicle
        </h1>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              defaultValue={q ?? ""}
              placeholder="Search by name or city"
              className="pl-9"
              onChange={(e) => {
                const value = e.target.value;
                navigate({
                  search: (prev) => ({ ...prev, q: value || undefined }),
                  replace: true,
                });
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={category ? "secondary" : "default"}
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, category: undefined }) })
              }
            >
              All
            </Button>
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "secondary"}
                onClick={() => navigate({ search: (prev) => ({ ...prev, category: c }) })}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isPending
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : data?.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>

        {!isPending && data?.length === 0 && (
          <EmptyState
            title="No vehicles match"
            description="Try clearing the search or picking a different category."
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
