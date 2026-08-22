import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/fleet/status-badge";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types";

export function VehicleCard({
  vehicle,
  className,
  compact = false,
}: {
  vehicle: Vehicle;
  className?: string;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "group panel relative flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-primary/40",
        className,
      )}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-surface-2">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          loading="lazy"
          width={1200}
          height={800}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-surface to-transparent" />
        <div className="absolute left-3 top-3">
          <StatusBadge status={vehicle.status} />
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-border bg-background/80 px-2 py-0.5 text-[11px] backdrop-blur">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="num">{vehicle.rating}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="eyebrow">
          {vehicle.category} · {vehicle.location.split(" — ")[0]}
        </p>
        <h3 className="mt-1.5 text-[15px] font-semibold leading-snug">{vehicle.name}</h3>

        {!compact && (
          <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-border py-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary/80" />
              <dd>{vehicle.seats} seats</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-primary/80" />
              <dd>{vehicle.transmission === "Automatic" ? "Auto" : "Manual"}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5 text-primary/80" />
              <dd>{vehicle.fuel}</dd>
            </div>
          </dl>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="leading-none">
            <span className="num text-lg font-semibold">{inr(vehicle.pricePerDay)}</span>
            <span className="ml-1 text-xs text-muted-foreground">/ day</span>
          </p>
          <Button asChild size="sm" variant="secondary" className="shrink-0">
            <Link to="/vehicles/$id" params={{ id: vehicle.id }}>
              View details
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
