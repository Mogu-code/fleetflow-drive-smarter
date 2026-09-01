import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

function useCountUp(value: number, duration = 900) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return display;
}

export function MetricCard({
  label,
  value,
  format = (n: number) => Math.round(n).toLocaleString("en-IN"),
  delta,
  hint,
  accent = false,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  delta?: number;
  hint?: string;
  accent?: boolean;
}) {
  const animated = useCountUp(value);
  return (
    <div
      className={cn(
        "panel relative overflow-hidden p-5 transition-colors hover:border-primary/40",
        accent && "border-primary/30",
      )}
    >
      {accent && <div className="ember-glow pointer-events-none absolute inset-0" />}
      <p className="eyebrow relative">{label}</p>
      <p className="num relative mt-2 text-2xl font-semibold sm:text-[28px]">{format(animated)}</p>
      <div className="relative mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              delta >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {delta >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}
