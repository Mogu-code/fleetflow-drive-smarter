import React from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/fleet/brand";
import heroVehicle from "@/assets/hero-vehicle.jpg";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Left Branding Side */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden border-r border-border/80 bg-surface">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroVehicle}
            alt="FleetFlow luxury automotive vehicle"
            className="h-full w-full object-cover opacity-25 brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
        </div>

        {/* Top Logo */}
        <div className="relative z-10">
          <Logo />
        </div>

        {/* Bottom Hero Story */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> FleetFlow Mobility
          </div>

          <h2 className="font-display text-4xl font-semibold tracking-tight leading-tight text-foreground">
            DRIVE WHAT FITS <br />
            <span className="text-primary">YOUR JOURNEY.</span>
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Intelligent vehicle rental built around real-time availability, digital document verification, and effortless self-drive mobility.
          </p>

          <div className="pt-4 flex items-center gap-6 text-xs text-muted-foreground border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> Verified Fleet
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> Instant Booking
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> 8 City Hubs
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} FleetFlow Platform. All rights reserved.
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="lg:hidden">
            <Logo />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md my-auto py-8 space-y-6 animate-rise">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Need help? <a href="#" className="text-primary underline">Contact FleetFlow Support</a>
        </div>
      </div>
    </div>
  );
}
