import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { analyticsService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/admin/insights")({
  head: () => ({
    meta: [
      { title: "AI Predictive Insights — FleetFlow Admin" },
      {
        name: "description",
        content: "Predictive demand alerts, fleet utilization intelligence, and pricing recommendations.",
      },
    ],
  }),
  component: AdminInsights,
});

function AdminInsights() {
  const { data: insights, isPending } = useQuery({
    queryKey: ["analytics", "insights"],
    queryFn: () => analyticsService.insights(),
  });

  return (
    <ProtectedRoute allowedRoles={["Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6">
            <Eyebrow>ARTIFICIAL INTELLIGENCE</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" /> AI Predictive Fleet Intelligence
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Automated demand forecasting, pricing optimization, and maintenance risk alerts.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {isPending ? (
              <div className="col-span-2 py-12 text-center text-muted-foreground">Loading AI predictions...</div>
            ) : insights?.map((ins) => (
              <div key={ins.id} className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-display font-semibold text-base text-foreground">{ins.title}</span>
                  </div>
                  <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                    {(ins.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{ins.detail}</p>
                <div className="pt-2 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wider">
                  <span>Category: {ins.category}</span>
                  <span className="font-bold text-foreground">Impact: {ins.impact.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
