import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { Button } from "@/components/ui/button";
import { Server, Play, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck, Lock } from "lucide-react";

export const Route = createFileRoute("/database/transactions")({
  head: () => ({
    meta: [
      { title: "ACID Booking Transactions — FleetFlow" },
      {
        name: "description",
        content: "Interactive ACID transaction workflow visualizer demonstrating BEGIN TRANSACTION, COMMIT, and simulated ROLLBACK safeguards.",
      },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "committed" | "rolledback">("idle");

  const STEPS = [
    { title: "BEGIN TRANSACTION", desc: "Open transactional boundary & acquire pessimistic lock on Vehicle V101." },
    { title: "Check Availability", desc: "Execute query: SELECT Status FROM Vehicle WHERE V_ID = 'V101' FOR UPDATE;" },
    { title: "Create Agreement Record", desc: "INSERT INTO Rental_Agreement (RA_ID, C_ID, V_ID, Start, End) VALUES (...);" },
    { title: "Process Payment Ledger", desc: "INSERT INTO Payment (Pay_ID, C_ID, Amount, Date) VALUES (...);" },
    { title: "Update Vehicle Status", desc: "UPDATE Vehicle SET Status = 'reserved' WHERE V_ID = 'V101';" },
    { title: "COMMIT / ROLLBACK", desc: "Finalize all write operations atomically or rollback on error." },
  ];

  const handleRunNextStep = () => {
    if (status === "idle" || status === "committed" || status === "rolledback") {
      setStatus("running");
      setCurrentStep(1);
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 4) {
      if (simulateFailure) {
        setCurrentStep(5);
        setStatus("rolledback");
      } else {
        setCurrentStep(5);
        setStatus("committed");
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setStatus("idle");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PresentationBar />
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
        <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Eyebrow>ACADEMIC TRANSACTION LAB</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Server className="w-7 h-7 text-primary" /> ACID Booking Transaction Workflow
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Step-by-step transaction boundary execution demonstrating atomic COMMIT and ROLLBACK safeguards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-warning">Simulate Payment Gateway Failure</span>
            </label>

            <Button size="sm" onClick={handleRunNextStep} disabled={status === "committed" || status === "rolledback"}>
              {status === "idle" ? "Begin Transaction" : "Execute Next Step"}
            </Button>

            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Transaction Stepper Visualizer */}
        <div className="p-8 rounded-3xl bg-surface border border-border space-y-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <div className="flex items-center gap-2 font-display font-semibold text-base text-foreground">
              <Lock className="w-4 h-4 text-primary" /> Transaction Control Block: TXN_70291
            </div>

            {status === "committed" && (
              <span className="text-xs font-bold uppercase px-3 py-1 rounded bg-success/20 text-success border border-success/30 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> TRANSACTION COMMITTED
              </span>
            )}

            {status === "rolledback" && (
              <span className="text-xs font-bold uppercase px-3 py-1 rounded bg-destructive/20 text-destructive border border-destructive/30 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> TRANSACTION ROLLED BACK
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {STEPS.map((st, idx) => {
              const active = currentStep === idx && status === "running";
              const done = currentStep > idx || status === "committed";
              const failed = idx === 5 && status === "rolledback";
              return (
                <div
                  key={st.title}
                  className={`p-4 rounded-2xl border transition-all text-xs space-y-2 ${
                    active
                      ? "bg-primary/20 border-primary ring-2 ring-primary/40 shadow-lg"
                      : done
                      ? "bg-surface-2 border-success/40 text-foreground"
                      : failed
                      ? "bg-destructive/20 border-destructive text-destructive"
                      : "bg-surface-2/50 border-border text-muted-foreground opacity-60"
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase font-bold opacity-70">Step 0{idx + 1}</div>
                  <div className="font-display font-bold text-sm text-foreground">{st.title}</div>
                  <p className="text-[11px] leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACID Explanations */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "ATOMICITY", desc: "All operations (agreement, payment, vehicle status) complete successfully or none do." },
            { title: "CONSISTENCY", desc: "Database transitions from one valid state to another, maintaining primary/foreign key constraints." },
            { title: "ISOLATION", desc: "Concurrent booking transactions execute without interfering or double-booking the same vehicle." },
            { title: "DURABILITY", desc: "Once committed, reservation records persist even in the event of system failures." },
          ].map((acid) => (
            <div key={acid.title} className="p-6 rounded-2xl bg-surface border border-border space-y-2 shadow-lg">
              <span className="text-xs font-mono font-bold uppercase text-primary">{acid.title}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{acid.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
