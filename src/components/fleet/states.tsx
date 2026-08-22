import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Inbox, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface-2 text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionTo && (
        <Button asChild size="sm" className="mt-2">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "We couldn't load this",
  description,
  actionLabel = "Try again",
  onRetry,
}: {
  title?: string;
  description: string;
  actionLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="panel flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      <div className="grid h-11 w-11 place-items-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}>
          <RefreshCcw className="mr-2 h-3.5 w-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("panel overflow-hidden", className)}>
      <Skeleton className="aspect-16/10 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="panel divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/6" />
          <Skeleton className="ml-auto h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="panel space-y-3 p-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
