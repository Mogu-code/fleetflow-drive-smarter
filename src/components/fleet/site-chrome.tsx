import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/fleet/brand";
import { Button } from "@/components/ui/button";
import { DemoBar } from "@/components/fleet/demo-bar";
import { GlobalSearchModal } from "@/components/fleet/global-search";
import { NotificationsDrawer } from "@/components/fleet/notifications-drawer";
import { AccountDropdown } from "@/components/auth/account-dropdown";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Search,
  Bell,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export function SiteHeader() {
  const { role, user, isAuthenticated } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const CUSTOMER_NAV = [
    { to: "/", label: "Home" },
    { to: "/explore", label: "Explore Fleet" },
    { to: "/recommendations", label: "Recommendations" },
    { to: "/bookings", label: "My Bookings" },
    { to: "/documents", label: "Documents" },
    { to: "/dashboard", label: "Dashboard" },
  ];

  const SALESPERSON_NAV = [
    { to: "/admin/sales", label: "Sales Overview" },
    { to: "/admin/bookings", label: "Bookings" },
    { to: "/admin/customers", label: "Customers" },
    { to: "/admin/vehicles", label: "Vehicles" },
    { to: "/admin/payments", label: "Payments" },
  ];

  const MECHANIC_NAV = [
    { to: "/admin/mechanic", label: "Service Bay" },
    { to: "/admin/vehicles", label: "Vehicles" },
    { to: "/admin/maintenance", label: "Maintenance" },
    { to: "/admin/health", label: "Fleet Health" },
  ];

  const MANAGER_NAV = [
    { to: "/admin", label: "Overview" },
    { to: "/admin/vehicles", label: "Vehicles" },
    { to: "/admin/bookings", label: "Bookings" },
    { to: "/admin/customers", label: "Customers" },
    { to: "/admin/employees", label: "Employees" },
    { to: "/admin/maintenance", label: "Maintenance" },
    { to: "/admin/payments", label: "Payments" },
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/insights", label: "AI Insights" },
  ];

  let navItems = CUSTOMER_NAV;
  if (role === "Salesperson") navItems = SALESPERSON_NAV;
  if (role === "Mechanic") navItems = MECHANIC_NAV;
  if (role === "Manager") navItems = MANAGER_NAV;

  return (
    <>
      <DemoBar />

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-4">
            <Logo />
            {role !== "Customer" && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold text-xs border border-primary/30">
                <LayoutDashboard className="w-3 h-3" /> {role} Portal
              </span>
            )}
          </div>

          {/* Role-Specific Navigation */}
          <nav className="hidden items-center gap-5 text-xs font-medium text-muted-foreground md:flex">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to as any}
                activeProps={{ className: "text-foreground font-bold" }}
                className="transition-colors hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border/80 text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
              title="Search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface-2 border border-border text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* AI Assistant CTA */}
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex gap-1.5 text-xs">
              <Link to="/ai">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI Assistant</span>
              </Link>
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <button
                onClick={() => setNotifOpen(true)}
                className="p-2 rounded-lg bg-surface border border-border/80 text-muted-foreground hover:text-foreground transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              </button>
            )}

            {/* Account Dropdown */}
            {isAuthenticated ? (
              <AccountDropdown />
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex text-xs">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="text-xs">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface p-4 space-y-3 animate-rise">
            <nav className="flex flex-col gap-2 text-xs">
              {navItems.map((n) => (
                <Link
                  key={n.to}
                  to={n.to as any}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-foreground hover:bg-surface-2 font-medium"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/ai"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg font-semibold text-primary hover:bg-surface-2 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> AI Fleet Assistant
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Modals & Drawers */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationsDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-surface/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
            Intelligent self-drive vehicle rental and fleet management platform powered by real-time telemetry and relational mock services.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 text-xs text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground block mb-2 uppercase tracking-wider text-[10px]">Product</span>
            <ul className="space-y-1">
              <li><Link to="/explore" className="hover:text-foreground">Fleet Discovery</Link></li>
              <li><Link to="/ai" className="hover:text-foreground">AI Intelligence</Link></li>
              <li><Link to="/recommendations" className="hover:text-foreground">Smart Recommendations</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-semibold text-foreground block mb-2 uppercase tracking-wider text-[10px]">Account & Portals</span>
            <ul className="space-y-1">
              <li><Link to="/login" className="hover:text-foreground">Sign In / Switch Demo Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">Renter Portal</Link></li>
              <li><Link to="/admin" className="hover:text-foreground">Enterprise Admin</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 py-4 px-5 sm:px-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FleetFlow Platform. All rights reserved.
      </div>
    </footer>
  );
}
