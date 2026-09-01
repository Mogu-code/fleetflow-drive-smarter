import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ThumbsUp, MapPin, Tag } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { CardSkeleton } from "@/components/fleet/states";
import { recommendationService, vehicleService } from "@/lib/services";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Smart Recommendations — FleetFlow Intelligence" },
      {
        name: "description",
        content: "Personalized vehicle recommendations based on past rental history, budget preferences, and location proximity.",
      },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { data: recs, isPending: recsPending } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => recommendationService.list(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "all-recs"],
    queryFn: () => vehicleService.list({}),
  });

  const BUCKET_ICONS = {
    "because-you-rented": ThumbsUp,
    "you-may-like": Sparkles,
    "popular-near-you": MapPin,
    "budget-match": Tag,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-10">
        {/* Header */}
        <div className="border-b border-border/80 pb-6">
          <Eyebrow>MACHINE INTELLIGENCE</Eyebrow>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" /> Smart Recommendations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tailored vehicle suggestions generated from your rental frequency, preferred vehicle specs, and hub proximity.
          </p>
        </div>

        {/* Recommendation Buckets */}
        {recsPending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="space-y-12">
            {recs?.map((r) => {
              const Icon = BUCKET_ICONS[r.bucket] || Sparkles;
              const matchedVeh = vehicles?.find((v) => v.id === r.vehicleId);
              if (!matchedVeh) return null;

              return (
                <div key={r.id} className="p-6 rounded-2xl bg-surface border border-border space-y-6 animate-rise">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-display font-semibold text-lg text-foreground">
                          {r.reason}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Category: <strong className="text-foreground">{r.bucket.replace(/-/g, " ").toUpperCase()}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {(r.confidence * 100).toFixed(0)}% AI Match Score
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Card Container */}
                  <div className="max-w-md">
                    <VehicleCard vehicle={matchedVeh} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
