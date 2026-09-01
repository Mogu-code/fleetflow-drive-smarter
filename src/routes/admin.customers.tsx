import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { inr } from "@/lib/format";
import { customerService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customer Registry & KYC — FleetFlow Admin" },
      {
        name: "description",
        content: "Registered renter accounts, driving credential verification status, and lifetime spend history.",
      },
    ],
  }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const { data: customers, isPending } = useQuery({
    queryKey: ["customers", "admin-list"],
    queryFn: () => customerService.list(),
  });

  return (
    <ProtectedRoute allowedRoles={["Manager", "Salesperson"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6">
            <Eyebrow>ENTERPRISE CUSTOMERS</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              Renter Accounts & KYC Database
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Customer profiles, license verification status, and loyalty tier rankings.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Customer ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Hub City</th>
                    <th className="p-3">Total Rentals</th>
                    <th className="p-3">Lifetime Spend</th>
                    <th className="p-3">KYC Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">Loading customer profiles...</td>
                    </tr>
                  ) : customers?.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-foreground">{c.id}</td>
                      <td className="p-3 font-semibold text-foreground">{c.name}</td>
                      <td className="p-3 text-muted-foreground">{c.email} • {c.phone}</td>
                      <td className="p-3 text-muted-foreground">{c.city}</td>
                      <td className="p-3 font-semibold text-foreground">{c.totalBookings}</td>
                      <td className="p-3 font-mono font-semibold text-primary">{inr(c.totalSpend)}</td>
                      <td className="p-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success/20 text-success flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" /> License Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
