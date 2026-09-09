import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { GitBranch, AlertTriangle, CheckCircle2, Info, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/database/normalization")({
  head: () => ({
    meta: [
      { title: "Normalization Visualizer (1NF - 3NF) — FleetFlow" },
      {
        name: "description",
        content: "Interactive before and after normalization visualizer demonstrating 1NF, 2NF, and 3NF database decomposition.",
      },
    ],
  }),
  component: NormalizationPage,
});

type NormalizationStage = "UNNORMALIZED" | "1NF" | "2NF" | "3NF";

function NormalizationPage() {
  const [stage, setStage] = useState<NormalizationStage>("UNNORMALIZED");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PresentationBar />
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
        <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Eyebrow>ACADEMIC NORMALIZATION LAB</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <GitBranch className="w-7 h-7 text-primary" /> Database Normalization Visualizer
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Decomposing unnormalized flat rental tables into 3rd Normal Form (3NF) to eliminate anomalies.
            </p>
          </div>
        </div>

        {/* Stage Selection Tabs */}
        <div className="flex border-b border-border/80 gap-2 text-xs font-semibold">
          {[
            { id: "UNNORMALIZED", label: "Unnormalized Flat Table", tag: "Denormalized (Anomalies)" },
            { id: "1NF", label: "1st Normal Form (1NF)", tag: "Atomic Values & PK" },
            { id: "2NF", label: "2nd Normal Form (2NF)", tag: "No Partial Dependencies" },
            { id: "3NF", label: "3rd Normal Form (3NF)", tag: "No Transitive Dependencies" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStage(st.id as NormalizationStage)}
              className={`pb-3 px-4 transition-all border-b-2 text-left ${
                stage === st.id
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div>{st.label}</div>
              <div className="text-[10px] font-mono opacity-70 mt-0.5">{st.tag}</div>
            </button>
          ))}
        </div>

        {/* Stage Content */}
        {stage === "UNNORMALIZED" && (
          <div className="space-y-6 animate-rise">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-xs space-y-2 text-destructive">
              <div className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Denormalized Flat Table Anomalies:
              </div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Redundancy:</strong> Customer Name & Phone repeated across every single rental record.</li>
                <li><strong>Insertion Anomaly:</strong> Cannot register a new vehicle without creating a dummy rental record.</li>
                <li><strong>Update Anomaly:</strong> Changing customer phone requires updating multiple rows across table.</li>
                <li><strong>Deletion Anomaly:</strong> Deleting a rental record deletes customer identity information.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
              <h3 className="font-display font-semibold text-base text-foreground font-mono">UNNORMALIZED_RENTAL_FLAT_TABLE</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-border/80 uppercase text-[9px] text-muted-foreground bg-surface-2">
                    <tr>
                      <th className="p-2.5">Rent_ID</th>
                      <th className="p-2.5">Cust_Name</th>
                      <th className="p-2.5 text-destructive font-bold">Cust_Phone (Repeated)</th>
                      <th className="p-2.5">Veh_Model</th>
                      <th className="p-2.5 text-destructive font-bold">Veh_Reg (Repeated)</th>
                      <th className="p-2.5">Emp_Name</th>
                      <th className="p-2.5">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-[11px]">
                    <tr className="hover:bg-surface-2/50">
                      <td className="p-2.5 font-bold text-foreground">R101</td>
                      <td className="p-2.5 text-foreground">Alex Morgan</td>
                      <td className="p-2.5 text-destructive font-bold">+91 98765 43210</td>
                      <td className="p-2.5 text-foreground">BMW X5</td>
                      <td className="p-2.5 text-destructive font-bold">KA01FF9021</td>
                      <td className="p-2.5 text-foreground">Sarah Mitchell</td>
                      <td className="p-2.5 text-primary">₹23,400</td>
                    </tr>
                    <tr className="hover:bg-surface-2/50">
                      <td className="p-2.5 font-bold text-foreground">R102</td>
                      <td className="p-2.5 text-foreground">Alex Morgan</td>
                      <td className="p-2.5 text-destructive font-bold">+91 98765 43210</td>
                      <td className="p-2.5 text-foreground">Mercedes C-Class</td>
                      <td className="p-2.5 text-destructive font-bold">KA03FF4192</td>
                      <td className="p-2.5 text-foreground">Sarah Mitchell</td>
                      <td className="p-2.5 text-primary">₹18,600</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {stage === "1NF" && (
          <div className="space-y-6 animate-rise">
            <div className="p-4 rounded-xl bg-surface-2 border border-border text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> 1st Normal Form (1NF) Criteria:
              </div>
              <p>Every attribute contains only atomic (indivisible) values, and a primary key (Rent_ID) is defined.</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
              <h3 className="font-display font-semibold text-base text-foreground font-mono">1NF_RENTAL_TABLE</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-border/80 uppercase text-[9px] text-muted-foreground bg-surface-2">
                    <tr>
                      <th className="p-2.5 text-primary font-bold">Rent_ID (PK)</th>
                      <th className="p-2.5">Cust_ID</th>
                      <th className="p-2.5">Cust_Name</th>
                      <th className="p-2.5">Veh_ID</th>
                      <th className="p-2.5">Veh_Model</th>
                      <th className="p-2.5">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-[11px]">
                    <tr className="hover:bg-surface-2/50">
                      <td className="p-2.5 font-bold text-primary">R101</td>
                      <td className="p-2.5">C201</td>
                      <td className="p-2.5">Alex Morgan</td>
                      <td className="p-2.5">V101</td>
                      <td className="p-2.5">BMW X5</td>
                      <td className="p-2.5 text-primary">₹23,400</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {stage === "2NF" && (
          <div className="space-y-6 animate-rise">
            <div className="p-4 rounded-xl bg-surface-2 border border-border text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> 2nd Normal Form (2NF) Criteria:
              </div>
              <p>Table is in 1NF and all non-key attributes are fully functionally dependent on the primary key (partial dependencies removed).</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 shadow-xl font-mono text-xs">
                <h4 className="font-bold text-foreground">CUSTOMER (Separated Entity)</h4>
                <div className="text-muted-foreground">C-ID (PK), Name, DOB, Mob-No, License-No</div>
              </div>
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 shadow-xl font-mono text-xs">
                <h4 className="font-bold text-foreground">VEHICLE (Separated Entity)</h4>
                <div className="text-muted-foreground">V-ID (PK), Model, Type, Reg-No, Fuel-Type</div>
              </div>
            </div>
          </div>
        )}

        {stage === "3NF" && (
          <div className="space-y-6 animate-rise">
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-xs text-success space-y-1">
              <div className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" /> 3rd Normal Form (3NF) Complete:
              </div>
              <p>Table is in 2NF and no non-key attribute depends transitively on another non-key attribute. Clean relational entities established!</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-mono text-xs">
              {["CUSTOMER", "EMPLOYEE", "SALESPERSON", "VEHICLE", "RENTAL AGREEMENT", "PAYMENT"].map((tbl) => (
                <div key={tbl} className="p-4 rounded-xl bg-surface border border-primary/40 space-y-1">
                  <div className="font-bold text-foreground">{tbl}</div>
                  <div className="text-[11px] text-muted-foreground">Normalized 3NF Relational Entity</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
