import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  to = "/",
  label = "FleetFlow",
}: {
  className?: string;
  to?: string;
  label?: string;
}) {
  return (
    <Link
      to={to}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${label} home`}
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-[6px] bg-primary">
        <span className="block h-3 w-3 rounded-[2px] bg-primary-foreground transition-transform duration-500 group-hover:translate-x-[2px]" />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">{label}</span>
    </Link>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-2">
      <span className="inline-block h-px w-6 bg-primary" />
      {children}
    </p>
  );
}
