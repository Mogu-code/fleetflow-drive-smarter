import React, { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/auth-context";
import { User, LayoutDashboard, LogOut, ChevronDown, RefreshCw, Car } from "lucide-react";
import { SwitchAccountModal } from "./switch-account-modal";

export function AccountDropdown() {
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.navigate({ to: "/" });
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-border hover:border-primary/50 text-foreground text-xs font-medium transition-all"
        >
          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary border border-primary/30 font-display font-bold flex items-center justify-center text-xs">
            {user.avatarLabel || "U"}
          </div>
          <span className="hidden md:inline-block font-semibold">{user.name.split(" ")[0]}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface border border-border shadow-2xl p-2 z-50 animate-rise space-y-1">
            {/* User Info Header */}
            <div className="p-3 border-b border-border/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-sm text-foreground truncate">{user.name}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">
                  {user.role}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>

            {/* Navigation Links */}
            <div className="py-1 space-y-0.5 text-xs">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-surface-2 transition-colors font-medium"
              >
                <User className="w-4 h-4 text-primary" /> My Profile
              </Link>

              {role === "Customer" && (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-surface-2 transition-colors font-medium"
                >
                  <Car className="w-4 h-4 text-primary" /> Renter Dashboard
                </Link>
              )}

              {role !== "Customer" && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-surface-2 transition-colors font-semibold text-primary"
                >
                  <LayoutDashboard className="w-4 h-4" /> Admin Console
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className="pt-1 border-t border-border/80 space-y-0.5">
              <button
                onClick={() => {
                  setOpen(false);
                  setSwitchModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors text-xs font-medium"
              >
                <RefreshCw className="w-4 h-4 text-primary" /> Switch Demo Account
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      <SwitchAccountModal
        isOpen={switchModalOpen}
        onClose={() => setSwitchModalOpen(false)}
      />
    </>
  );
}
