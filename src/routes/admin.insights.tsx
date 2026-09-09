import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { analyticsService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/insights")({
  head: () => ({
    meta: [
      { title: "AI Decision Intelligence — FleetFlow Manager" },
      {
        name: "description",
        content: "Operational decision support, maintenance frequency alerts, demand forecasts, and fleet optimization insights.",
      },
    ],
  }),
  component: AdminInsights,
});

function AdminInsights() {
  const navigate = useNavigate();

  const { data: insights, isPending } = useQuery({
    queryKey: ["analytics", "insights-page"],
    queryFn: () => analyticsService.insights(),
  });

  return (
    <ProtectedRoute allowedRoles={["Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>DECISION INTELLIGENCE</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  AI DECISION RECOMMENDATIONS
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-primary" /> AI Management Insights & Operational Alerts
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Predictive fleet maintenance risk alerts, demand forecasting, and rate optimization recommendations.
              </p>
            </div>
          </div>

          {/* AI Source Callout */}
          <div className="p-4 rounded-2xl bg-surface border border-border text-xs text-muted-foreground space-y-1 font-mono">
            <div className="font-bold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> Operational Source Context:
            </div>
            <p>
              AI insights analyze structured operational data (`fleetStore`, `MOCK_VEHICLES`, `MOCK_MAINTENANCE`) to provide decision support. They do not override manager authorization or alter database schemas.
            </p>
          </div>

          {/* Insights Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {isPending ? (
              <div className="col-span-2 py-12 text-center text-muted-foreground font-mono">Analyzing fleet telemetry...</div>
            ) : insights?.map((ins) => (
              <div key={ins.id} className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-display font-semibold text-base text-foreground">{ins.title}</span>
                    </div>
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono">
                      {(ins.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">{ins.detail}</p>
                </div>

                <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                    Category: <strong className="text-foreground">{ins.category}</strong> • Impact: <strong className="text-primary">{ins.impact.toUpperCase()}</strong>
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 font-semibold"
                    onClick={() => {
                      if (ins.category === "Maintenance") navigate({ to: "/admin/maintenance" });
                      else if (ins.category === "Demand") navigate({ to: "/admin/vehicles" });
                      else navigate({ to: "/admin/analytics" });
                    }}
                  >
                    View Related Entity <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
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
