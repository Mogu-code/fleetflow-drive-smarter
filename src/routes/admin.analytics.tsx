import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Sparkles } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { analyticsService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Fleet Telemetry Analytics & AI Insights — FleetFlow Admin" },
      {
        name: "description",
        content: "Deep utilization trends, operational demand forecasts, and machine learning insight alerts.",
      },
    ],
  }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { data: metrics } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsService.overview(),
  });

  const { data: insights } = useQuery({
    queryKey: ["analytics", "insights"],
    queryFn: () => analyticsService.insights(),
  });

  return (
    <ProtectedRoute allowedRoles={["Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6">
            <Eyebrow>FLEET TELEMETRY</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              Advanced Operational Analytics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time fleet utilization rates, revenue forecasting, and AI operational insights.
            </p>
          </div>

          {/* AI Operational Insights Section */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2 font-display font-semibold text-lg text-foreground">
              <Sparkles className="w-5 h-5 text-primary" /> AI Operational Insights & Demand Alerts
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {insights?.map((ins) => (
                <div key={ins.id} className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm">{ins.title}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/20 text-primary">
                      {(ins.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Utilization Trend Line Chart */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="border-b border-border/80 pb-3">
              <h3 className="font-display font-semibold text-base text-foreground">Fleet Utilization Trend (%)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics?.utilizationTrend || []}>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "#141A26", borderColor: "#2D3748", borderRadius: 8, color: "#fff" }} />
                  <Line type="monotone" dataKey="rate" stroke="#F96728" strokeWidth={3} dot={{ fill: "#F96728" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
