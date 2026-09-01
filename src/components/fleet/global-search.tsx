import React, { useState, useEffect } from "react";
import { searchService, type SearchHit } from "@/lib/services";
import { Search, Car, Calendar, Users, CreditCard, Wrench, ArrowRight, X } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/auth-context";

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, can } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const hits = await searchService.query(query);

      // Filter search results using permission system
      const filteredHits = hits.filter((h) => {
        if (h.group === "Vehicles") return true; // Everyone can search vehicles
        if (h.group === "Bookings") return can("viewBookings");
        if (h.group === "Customers") return can("viewCustomers");
        if (h.group === "Payments") return can("viewPayments");
        if (h.group === "Maintenance") return can("viewMaintenance");
        return true;
      });

      setResults(filteredHits);
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (hit: SearchHit) => {
    onClose();
    if (hit.params && "id" in hit.params && hit.params.id) {
      router.navigate({ to: hit.to as any, params: { id: hit.params.id } });
    } else {
      router.navigate({ to: hit.to as any });
    }
  };

  const GROUP_ICONS = {
    Vehicles: Car,
    Bookings: Calendar,
    Customers: Users,
    Payments: CreditCard,
    Maintenance: Wrench,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-xs animate-rise">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-border/80 gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vehicles, bookings, customers, payments... (ESC to exit)"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-hidden text-sm"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Searching fleet registry...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No matching entity found for "{query}".
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 px-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {["Volvo", "FF-24817", "Aviskha", "PAY-70210", "Maintenance"].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setQuery(sample)}
                    className="px-2 py-1 rounded bg-surface-2 hover:bg-border text-foreground transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((hit) => {
                const Icon = GROUP_ICONS[hit.group] || Car;
                return (
                  <button
                    key={hit.id}
                    onClick={() => handleSelect(hit)}
                    className="w-full flex items-center justify-between p-3 rounded-lg text-left hover:bg-surface-2 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-background border border-border/60 text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {hit.label}
                        </div>
                        <div className="text-xs text-muted-foreground">{hit.sub}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {hit.group}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
