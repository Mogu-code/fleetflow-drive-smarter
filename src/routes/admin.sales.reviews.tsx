import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, AlertTriangle, CheckCircle2, MessageSquare, Filter, ArrowRight, User, Car, Calendar } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { Button } from "@/components/ui/button";
import { reviewService, vehicleService, customerService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import type { Review } from "@/types";

export const Route = createFileRoute("/admin/sales/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews & Feedback — Sales Desk" },
      {
        name: "description",
        content: "Track customer reviews, rating feedback, and service issue resolution linked to vehicles and bookings.",
      },
    ],
  }),
  component: ReviewsWorkspace,
});

type RatingFilter = "all" | "positive" | "neutral" | "attention";
type SortOption = "newest" | "highest" | "lowest";

function ReviewsWorkspace() {
  const [filter, setFilter] = useState<RatingFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const { data: reviews, isPending } = useQuery({
    queryKey: ["reviews", "sales-workspace"],
    queryFn: () => reviewService.listAll(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", "sales-workspace-reviews"],
    queryFn: () => vehicleService.list({}),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers", "sales-workspace-reviews"],
    queryFn: () => customerService.list(),
  });

  // Filter Logic
  const filteredReviews = reviews?.filter((r) => {
    if (filter === "positive") return r.rating >= 4;
    if (filter === "neutral") return r.rating === 3;
    if (filter === "attention") return r.rating <= 2;
    return true;
  });

  // Sort Logic
  const sortedReviews = React.useMemo(() => {
    if (!filteredReviews) return [];
    const list = [...filteredReviews];
    if (sort === "highest") return list.sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") return list.sort((a, b) => a.rating - b.rating);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredReviews, sort]);

  const needsAttentionList = reviews?.filter((r) => r.rating <= 2) || [];

  return (
    <ProtectedRoute allowedRoles={["Salesperson", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>CUSTOMER EXPERIENCE</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-warning/20 text-warning border border-warning/30">
                  Relational Extension: Review ↔ Vehicle ↔ Customer
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Star className="w-7 h-7 text-warning" /> Customer Reviews & Feedback Desk
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review ratings linked to specific rental bookings, vehicles, and customer accounts.
              </p>
            </div>
          </div>

          {/* NEEDS ATTENTION ALERT SECTION */}
          {needsAttentionList.length > 0 && (
            <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-destructive/20 pb-3">
                <div className="flex items-center gap-2 font-display font-semibold text-destructive text-base">
                  <AlertTriangle className="w-5 h-5" /> Reviews Needing Salesperson Attention ({needsAttentionList.length})
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-destructive/20 text-destructive">
                  Action Required
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {needsAttentionList.map((r) => {
                  const v = vehicles?.find((veh) => veh.id === r.vehicleId);
                  const c = customers?.find((cust) => cust.id === r.customerId);
                  return (
                    <div key={r.id} className="p-4 rounded-xl bg-surface border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-warning font-bold text-xs">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                          <span className="ml-1 text-foreground">{r.rating}.0 / 5.0</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{r.createdAt}</span>
                      </div>

                      <p className="text-xs text-foreground font-medium italic">"{r.body}"</p>

                      <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-[11px]">
                        <div>Customer C-ID: <strong className="text-primary font-mono">{r.customerId}</strong></div>
                        <div>Vehicle V-ID: <strong className="text-primary font-mono">{r.vehicleId}</strong></div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button asChild size="sm" variant="outline" className="h-7 text-[11px] flex-1">
                          <Link to="/admin/customers">View Customer</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="h-7 text-[11px] flex-1">
                          <Link to="/admin/vehicles">View Vehicle</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FILTER AND SORT BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-md">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Reviews" },
                { id: "positive", label: "Positive (4-5 ★)" },
                { id: "neutral", label: "Neutral (3 ★)" },
                { id: "attention", label: "Needs Attention (1-2 ★)" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id as RatingFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    filter === t.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-xl bg-surface-2 border border-border px-3 py-1.5 text-xs text-foreground font-semibold"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* REVIEWS GRID */}
          {isPending ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading customer reviews...</div>
          ) : sortedReviews.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface border border-border text-center text-sm text-muted-foreground">
              No customer reviews match this filter category.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedReviews.map((r) => {
                const v = vehicles?.find((veh) => veh.id === r.vehicleId);
                const c = customers?.find((cust) => cust.id === r.customerId);
                return (
                  <div key={r.id} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors shadow-lg">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-border/80 pb-3">
                        <div className="flex items-center gap-1 text-warning font-bold text-xs">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{r.createdAt}</span>
                      </div>

                      <h4 className="font-display font-semibold text-sm text-foreground">{r.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">"{r.body}"</p>

                      <div className="pt-2 border-t border-border/60 space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-primary" />
                          <span className="font-medium text-foreground">{c?.name || "Customer"}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">({r.customerId})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="w-3.5 h-3.5 text-primary" />
                          <span className="font-medium text-foreground">{v?.name || "Vehicle"}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">({r.vehicleId})</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/80 flex justify-end">
                      <Button asChild size="sm" variant="ghost" className="h-7 text-xs gap-1">
                        <Link to="/admin/bookings">View Related Booking <ArrowRight className="w-3 h-3" /></Link>
                      </Button>
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
