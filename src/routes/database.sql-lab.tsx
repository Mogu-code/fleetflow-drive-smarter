import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { Button } from "@/components/ui/button";
import { FileCode2, Play, Database, CheckCircle2, Info } from "lucide-react";
import {
  vehicles,
  customers,
  employees,
  bookings,
  payments,
  maintenanceRecords,
  rentalAgreements,
} from "@/lib/mock-data";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/database/sql-lab")({
  head: () => ({
    meta: [
      { title: "SQL Demonstration Lab — FleetFlow DBMS Academic Case Study" },
      {
        name: "description",
        content: "Execute simulated SELECT, JOIN, AGGREGATION, and DBMS query statements against live relational mock data.",
      },
    ],
  }),
  component: SQLLabPage,
});

interface PresetQuery {
  id: string;
  category: "BASIC SQL" | "AGGREGATION" | "JOINS" | "DBMS CONCEPTS";
  title: string;
  sql: string;
  explanation: string;
  run: () => { headers: string[]; rows: (string | number)[][] };
}

const PRESET_QUERIES: PresetQuery[] = [
  {
    id: "q1",
    category: "BASIC SQL",
    title: "Select All SUV Fleet Vehicles",
    sql: "SELECT V_ID, Model, Reg_No, Fuel_Type, Daily_Rate\nFROM Vehicle\nWHERE Type = 'SUV';",
    explanation: "Standard SELECT query with WHERE clause filtering physical vehicles by SUV category.",
    run: () => {
      const suvs = vehicles.filter((v) => v.category === "SUV");
      return {
        headers: ["V_ID", "Model", "Reg_No", "Fuel_Type", "Daily_Rate"],
        rows: suvs.map((v) => [v.id, v.model, v.registration, v.fuel, inr(v.pricePerDay)]),
      };
    },
  },
  {
    id: "q2",
    category: "JOINS",
    title: "Join Customer & Rental Agreement Records",
    sql: "SELECT Customer.C_ID, Customer.Name, Rental_Agreement.RA_ID, Rental_Agreement.V_ID, Rental_Agreement.Amount\nFROM Customer\nJOIN Rental_Agreement ON Customer.C_ID = Rental_Agreement.C_ID;",
    explanation: "INNER JOIN linking Customer primary key (C-ID) to Rental Agreement foreign key (C-ID).",
    run: () => {
      const agrs = rentalAgreements;
      return {
        headers: ["C_ID", "Customer Name", "RA_ID", "V_ID", "Amount"],
        rows: agrs.map((a) => {
          const cust = customers.find((c) => c.id === a.customerId);
          return [a.customerId, cust?.name || "Alex Morgan", a.id, a.vehicleId, inr(a.amount)];
        }),
      };
    },
  },
  {
    id: "q3",
    category: "AGGREGATION",
    title: "Calculate Total Payments & Average Booking Value",
    sql: "SELECT COUNT(Pay_ID) AS Total_Transactions, SUM(Amount) AS Total_Revenue, AVG(Amount) AS Avg_Payment\nFROM Payment;",
    explanation: "Aggregate functions (COUNT, SUM, AVG) summarizing payment transaction records.",
    run: () => {
      const pays = payments;
      const count = pays.length;
      const total = pays.reduce((acc, p) => acc + p.amount, 0);
      const avg = count > 0 ? Math.round(total / count) : 0;
      return {
        headers: ["Total_Transactions", "Total_Revenue", "Avg_Payment"],
        rows: [[count, inr(total), inr(avg)]],
      };
    },
  },
  {
    id: "q4",
    category: "DBMS CONCEPTS",
    title: "Join Mechanic, ISA Employee & Maintenance Weak Entity",
    sql: "SELECT Mechanic.E_ID, Employee.Name, Mechanic.Specialization, Maintenance_Record.M_ID, Maintenance_Record.Cost\nFROM Mechanic\nJOIN Employee ON Mechanic.E_ID = Employee.E_ID\nJOIN Services ON Mechanic.E_ID = Services.E_ID\nJOIN Maintenance_Record ON Services.V_ID = Maintenance_Record.V_ID;",
    explanation: "Multi-table join combining ISA Subclass Employee details with M:N Services junction and Weak Entity Maintenance Records.",
    run: () => {
      const records = maintenanceRecords;
      return {
        headers: ["E_ID", "Mechanic Name", "Specialization", "M_ID (Partial Key)", "Cost"],
        rows: records.map((m) => {
          const mech = employees.find((e) => e.role === "Mechanic");
          return [m.mechanicId || "E311", mech?.name || "Daniel Carter", "EV Powertrain & Systems", m.id, inr(m.cost)];
        }),
      };
    },
  },
];

function SQLLabPage() {
  const [activeQuery, setActiveQuery] = useState<PresetQuery>(PRESET_QUERIES[0]);
  const [customSql, setCustomSql] = useState(PRESET_QUERIES[0].sql);
  const [result, setResult] = useState<{ headers: string[]; rows: (string | number)[][] } | null>(
    PRESET_QUERIES[0].run()
  );
  const [executing, setExecuting] = useState(false);

  const handleSelectQuery = (q: PresetQuery) => {
    setActiveQuery(q);
    setCustomSql(q.sql);
    setResult(q.run());
  };

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      setResult(activeQuery.run());
      setExecuting(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PresentationBar />
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
        <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Eyebrow>ACADEMIC SQL SIMULATOR</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <FileCode2 className="w-7 h-7 text-primary" /> SQL Demonstration Lab
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Execute structured database queries against FleetFlow relational mock entities.
            </p>
          </div>

          <span className="text-xs font-mono uppercase font-bold px-3 py-1 rounded bg-warning/20 text-warning border border-warning/30">
            SQL Simulation — Mock Relational Data
          </span>
        </div>

        {/* Query Presets Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRESET_QUERIES.map((q) => (
            <button
              key={q.id}
              onClick={() => handleSelectQuery(q)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeQuery.id === q.id
                  ? "bg-primary/20 border-primary ring-1 ring-primary shadow-lg"
                  : "bg-surface border-border hover:border-primary/50 text-muted-foreground"
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase text-primary block mb-1">
                {q.category}
              </span>
              <div className="font-display font-semibold text-xs text-foreground truncate">{q.title}</div>
            </button>
          ))}
        </div>

        {/* SQL Editor & Console */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-foreground">
              <Database className="w-4 h-4 text-primary" /> SQL Query Console
            </div>
            <Button size="sm" onClick={handleExecute} disabled={executing} className="gap-1.5 font-semibold">
              <Play className="w-3.5 h-3.5 fill-current" /> Execute Query
            </Button>
          </div>

          {/* SQL Editor Window */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border font-mono text-xs text-primary leading-relaxed">
            <textarea
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              rows={4}
              className="w-full bg-transparent outline-hidden resize-none text-foreground font-mono"
            />
          </div>

          <div className="p-3 rounded-lg bg-surface-2/60 border border-border text-xs text-muted-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>{activeQuery.explanation}</span>
          </div>
        </div>

        {/* Result Table Output */}
        {result && (
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl animate-rise">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <CheckCircle2 className="w-4 h-4 text-success" /> Query Execution Results ({result.rows.length} rows returned)
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">Execution Time: 0.42ms</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground bg-surface-2">
                  <tr>
                    {result.headers.map((h) => (
                      <th key={h} className="p-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {result.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-2/50 transition-colors">
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} className="p-3 font-semibold text-foreground">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
