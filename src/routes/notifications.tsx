import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/auth-context";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { notificationService } from "@/lib/services";
import type { FleetNotification } from "@/types";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Bell, CheckCircle, ShieldAlert, Sparkles, CreditCard, Clock } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Feed — FleetFlow" },
      {
        name: "description",
        content: "Personalized notifications, reservation confirmations, payment receipts, and return reminders.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<FleetNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.list().then((res) => {
      setItems(res);
      setLoading(false);
    });
  }, []);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const ICON_MAP = {
    booking: CheckCircle,
    payment: CreditCard,
    document: CheckCircle,
    maintenance: ShieldAlert,
    ai: Sparkles,
    reminder: Clock,
  };

  return (
    <ProtectedRoute allowedRoles={["Customer", "Salesperson", "Mechanic", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6 flex items-center justify-between">
            <div>
              <Eyebrow>ACCOUNT ACTIVITY</Eyebrow>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Bell className="w-7 h-7 text-primary" /> Notifications
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Activity updates and alerts personalized for {user?.name}.
              </p>
            </div>
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Mark all read
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Loading notifications...</div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No notifications.</div>
            ) : (
              items.map((n) => {
                const Icon = ICON_MAP[n.kind] || Bell;
                return (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      n.read
                        ? "bg-surface/50 border-border/50 text-muted-foreground"
                        : "bg-surface border-border text-foreground shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          n.kind === "maintenance"
                            ? "bg-destructive/20 text-destructive border border-destructive/30"
                            : n.kind === "ai"
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-surface-2 border border-border text-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm text-foreground truncate">{n.title}</h3>
                          <span className="text-xs text-muted-foreground font-mono">{n.at}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
