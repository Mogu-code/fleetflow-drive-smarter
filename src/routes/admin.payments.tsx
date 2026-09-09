import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, CheckCircle2, Search, FileText, X } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { inr } from "@/lib/format";
import { paymentService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/types";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payment Transaction Ledger — FleetFlow Operations" },
      {
        name: "description",
        content: "Track transaction payments, Razorpay UPI references, and booking receipt settlements.",
      },
    ],
  }),
  component: AdminPayments,
});

function AdminPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const { data: payments, isPending } = useQuery({
    queryKey: ["payments", "admin-workspace"],
    queryFn: () => paymentService.list(),
  });

  const filteredPayments = payments?.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      p.id.toLowerCase().includes(q) ||
      p.bookingId.toLowerCase().includes(q) ||
      p.customerId.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={["Manager", "Salesperson"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>FINANCIAL LEDGER</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-success/20 text-success border border-success/30">
                  PAYMENT (Pay-ID) ENTITY
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <CreditCard className="w-7 h-7 text-primary" /> Payment Transaction Ledger Workspace
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Transaction settlement ledger, Razorpay UPI references, and payment receipt verifications.
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="p-4 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Pay-ID, RA-ID, C-ID, Ref..."
                className="w-full rounded-lg bg-surface-2 border border-border pl-9 pr-3 py-2 text-xs text-foreground focus:outline-hidden font-mono"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs text-foreground font-semibold"
              >
                <option value="all">All Payment Statuses</option>
                <option value="completed">Completed Settlements</option>
                <option value="pending">Pending Processing</option>
                <option value="refunded">Refunded Transactions</option>
              </select>
            </div>
          </div>

          {/* Payment Data Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Payment Pay-ID</th>
                    <th className="p-3">Contract RA-ID</th>
                    <th className="p-3">Customer C-ID</th>
                    <th className="p-3 font-sans">Method</th>
                    <th className="p-3">Gateway Reference</th>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right font-sans">Receipt Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-[11px]">
                  {isPending ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground font-sans">Loading transaction ledger...</td>
                    </tr>
                  ) : filteredPayments?.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3 font-bold text-foreground">{p.id}</td>
                      <td className="p-3 text-muted-foreground">{p.bookingId}</td>
                      <td className="p-3 font-bold text-primary">{p.customerId}</td>
                      <td className="p-3 font-sans font-semibold text-foreground">{p.method}</td>
                      <td className="p-3 text-muted-foreground text-[10px]">{p.reference}</td>
                      <td className="p-3 text-muted-foreground">{p.date}</td>
                      <td className="p-3 font-bold text-primary">{inr(p.amount)}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-success/20 text-success flex items-center gap-1 w-fit uppercase">
                          <CheckCircle2 className="w-3 h-3" /> {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-sans">
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setSelectedReceipt(p)}>
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <SiteFooter />

        {/* MODAL: VIEW PAYMENT RECEIPT */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-bold text-base text-foreground font-sans">Payment Settlement Receipt</h3>
                <button onClick={() => setSelectedReceipt(null)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-surface-2 border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Pay-ID:</span><strong>{selectedReceipt.id}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Contract RA-ID:</span><strong>{selectedReceipt.bookingId}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Customer C-ID:</span><strong className="text-primary">{selectedReceipt.customerId}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Payment Method:</span><strong>{selectedReceipt.method}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gateway Ref:</span><strong className="text-[10px]">{selectedReceipt.reference}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Settlement Date:</span><strong>{selectedReceipt.date}</strong></div>
                <div className="flex justify-between pt-2 border-t border-border/60 text-sm"><span className="text-muted-foreground">Total Paid:</span><strong className="text-primary font-bold">{inr(selectedReceipt.amount)}</strong></div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button size="sm" onClick={() => setSelectedReceipt(null)}>Close Receipt</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
