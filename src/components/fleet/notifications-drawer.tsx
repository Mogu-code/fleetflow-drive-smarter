import React, { useState, useEffect } from "react";
import { notificationService } from "@/lib/services";
import type { FleetNotification } from "@/types";
import { Bell, CheckCircle, ShieldAlert, Sparkles, CreditCard, Clock, X } from "lucide-react";

export function NotificationsDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<FleetNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      notificationService.list().then((res) => {
        setItems(res);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!isOpen) return null;

  const ICON_MAP = {
    booking: CheckCircle,
    payment: CreditCard,
    document: CheckCircle,
    maintenance: ShieldAlert,
    ai: Sparkles,
    reminder: Clock,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-rise">
      <div className="bg-surface border-l border-border w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-base text-foreground">Notifications</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              {items.filter((i) => !i.read).length} new
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Fetching updates...
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No notifications right now.
            </div>
          ) : (
            items.map((n) => {
              const Icon = ICON_MAP[n.kind] || Bell;
              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.read
                      ? "bg-surface/50 border-border/50 text-muted-foreground"
                      : "bg-surface-2 border-border text-foreground shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        n.kind === "maintenance"
                          ? "bg-destructive/20 text-destructive"
                          : n.kind === "ai"
                          ? "bg-primary/20 text-primary"
                          : "bg-background border border-border text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {n.at}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {n.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
