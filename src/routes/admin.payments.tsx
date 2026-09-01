import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, CheckCircle2 } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { inr } from "@/lib/format";
import { paymentService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payment Ledger — FleetFlow Admin" },
      {
        name: "description",
        content: "Track transaction payments, Razorpay UPI references, and booking receipts.",
      },
    ],
  }),
  component: AdminPayments,
});

function AdminPayments() {
  const { data: payments, isPending } = useQuery({
    queryKey: ["payments", "admin-list"],
    queryFn: () => paymentService.list(),
  });

  return (
    <ProtectedRoute allowedRoles={["Manager", "Salesperson"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6">
            <Eyebrow>FINANCIAL OPERATIONS</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-primary" /> Payment Transaction Ledger
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time payment gateway transactions, Razorpay references, and settlement status.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Payment ID</th>
                    <th className="p-3">Booking Ref</th>
                    <th className="p-3">Customer ID</th>
                    <th className="p-3">Gateway Method</th>
                    <th className="p-3">Gateway Ref</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">Loading payment ledger...</td>
                    </tr>
                  ) : payments?.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-foreground">{p.id}</td>
                      <td className="p-3 font-mono text-muted-foreground">{p.bookingId}</td>
                      <td className="p-3 font-mono text-muted-foreground">{p.customerId}</td>
                      <td className="p-3 font-semibold text-foreground">{p.method}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{p.reference}</td>
                      <td className="p-3 text-muted-foreground">{p.date}</td>
                      <td className="p-3 font-mono font-bold text-primary">{inr(p.amount)}</td>
                      <td className="p-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success/20 text-success flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> {p.status.toUpperCase()}
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
