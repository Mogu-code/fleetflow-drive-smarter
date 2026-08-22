import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/30",
  warning: "bg-warning/12 text-warning border-warning/30",
  danger: "bg-destructive/12 text-destructive border-destructive/30",
  info: "bg-info/12 text-info border-info/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

const MAP: Record<string, Tone> = {
  available: "success",
  paid: "success",
  verified: "success",
  completed: "success",
  active: "info",
  confirmed: "info",
  reserved: "info",
  "in-progress": "info",
  scheduled: "info",
  pending: "warning",
  "on-leave": "warning",
  rented: "warning",
  maintenance: "warning",
  expired: "warning",
  overdue: "danger",
  cancelled: "danger",
  failed: "danger",
  rejected: "danger",
  suspended: "danger",
  inactive: "neutral",
  refunded: "neutral",
};

export function StatusBadge({
  status,
  className,
  dot = true,
}: {
  status: string;
  className?: string;
  dot?: boolean;
}) {
  const tone = MAP[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
        TONE[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current",
            tone === "success" && "animate-pulse",
          )}
        />
      )}
      {status.replace("-", " ")}
    </span>
  );
}
