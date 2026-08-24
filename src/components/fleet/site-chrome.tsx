import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/fleet/brand";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore fleet" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-foreground" }}
              className="transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm">
          <Link to="/explore">Book a vehicle</Link>
        </Button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Premium self-drive rentals and fleet operations, run from one console.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} FleetFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
