import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { Button } from "@/components/ui/button";
import { Database, Search, ArrowRight, Key, Link as LinkIcon, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/database/schema")({
  head: () => ({
    meta: [
      { title: "Relational Schema Visualizer — FleetFlow" },
      {
        name: "description",
        content: "Interactive Relational Schema visualizer displaying table attributes, primary keys, foreign key links, and entity relationships.",
      },
    ],
  }),
  component: SchemaPage,
});

interface SchemaTable {
  name: string;
  category: "Core Entity" | "Employee Specialization" | "Weak Entity" | "Junction Table";
  primaryKey: string[];
  columns: { name: string; type: string; isPk?: boolean; isFk?: boolean; fkTarget?: string; constraint?: string }[];
}

const TABLES: SchemaTable[] = [
  {
    name: "CUSTOMER",
    category: "Core Entity",
    primaryKey: ["C-ID"],
    columns: [
      { name: "C-ID", type: "VARCHAR(10)", isPk: true, constraint: "NOT NULL" },
      { name: "Name", type: "VARCHAR(50)", constraint: "NOT NULL" },
      { name: "DOB", type: "DATE", constraint: "NOT NULL" },
      { name: "Gender", type: "VARCHAR(10)" },
      { name: "Mob-No", type: "VARCHAR(15)", constraint: "UNIQUE, NOT NULL" },
      { name: "License-No", type: "VARCHAR(20)", constraint: "UNIQUE" },
    ],
  },
  {
    name: "EMPLOYEE",
    category: "Core Entity",
    primaryKey: ["E-ID"],
    columns: [
      { name: "E-ID", type: "VARCHAR(10)", isPk: true, constraint: "NOT NULL" },
      { name: "Name", type: "VARCHAR(50)", constraint: "NOT NULL" },
      { name: "Salary", type: "DECIMAL(10,2)", constraint: "NOT NULL" },
      { name: "Sex", type: "CHAR(1)" },
      { name: "Mob-No", type: "VARCHAR(15)", constraint: "UNIQUE" },
      { name: "Address", type: "VARCHAR(100)" },
      { name: "State", type: "VARCHAR(30)" },
      { name: "City", type: "VARCHAR(30)" },
      { name: "Pin-No", type: "VARCHAR(10)" },
    ],
  },
  {
    name: "SALESPERSON",
    category: "Employee Specialization",
    primaryKey: ["E-ID"],
    columns: [
      { name: "E-ID", type: "VARCHAR(10)", isPk: true, isFk: true, fkTarget: "EMPLOYEE.E-ID", constraint: "FK → EMPLOYEE" },
      { name: "Target", type: "DECIMAL(12,2)" },
      { name: "Commission", type: "DECIMAL(4,2)" },
    ],
  },
  {
    name: "MECHANIC",
    category: "Employee Specialization",
    primaryKey: ["E-ID"],
    columns: [
      { name: "E-ID", type: "VARCHAR(10)", isPk: true, isFk: true, fkTarget: "EMPLOYEE.E-ID", constraint: "FK → EMPLOYEE" },
      { name: "Specialization", type: "VARCHAR(50)" },
      { name: "Shift", type: "VARCHAR(15)" },
    ],
  },
  {
    name: "MANAGER",
    category: "Employee Specialization",
    primaryKey: ["E-ID"],
    columns: [
      { name: "E-ID", type: "VARCHAR(10)", isPk: true, isFk: true, fkTarget: "EMPLOYEE.E-ID", constraint: "FK → EMPLOYEE" },
      { name: "Branch-ID", type: "VARCHAR(10)", constraint: "NOT NULL" },
    ],
  },
  {
    name: "VEHICLE",
    category: "Core Entity",
    primaryKey: ["V-ID"],
    columns: [
      { name: "V-ID", type: "VARCHAR(10)", isPk: true, constraint: "NOT NULL" },
      { name: "Type", type: "VARCHAR(30)", constraint: "NOT NULL" },
      { name: "Model", type: "VARCHAR(50)", constraint: "NOT NULL" },
      { name: "Reg-No", type: "VARCHAR(20)", constraint: "UNIQUE, NOT NULL" },
      { name: "Fuel-Type", type: "VARCHAR(15)", constraint: "NOT NULL" },
      { name: "Capacity", type: "INT", constraint: "NOT NULL" },
    ],
  },
  {
    name: "RENTAL AGREEMENT",
    category: "Core Entity",
    primaryKey: ["RA-ID"],
    columns: [
      { name: "RA-ID", type: "VARCHAR(10)", isPk: true, constraint: "NOT NULL" },
      { name: "C-ID", type: "VARCHAR(10)", isFk: true, fkTarget: "CUSTOMER.C-ID", constraint: "FK → CUSTOMER" },
      { name: "V-ID", type: "VARCHAR(10)", isFk: true, fkTarget: "VEHICLE.V-ID", constraint: "FK → VEHICLE" },
      { name: "Start-Date", type: "DATE", constraint: "NOT NULL" },
      { name: "End-Date", type: "DATE", constraint: "NOT NULL" },
    ],
  },
  {
    name: "PAYMENT",
    category: "Core Entity",
    primaryKey: ["Pay-ID"],
    columns: [
      { name: "Pay-ID", type: "VARCHAR(10)", isPk: true, constraint: "NOT NULL" },
      { name: "C-ID", type: "VARCHAR(10)", isFk: true, fkTarget: "CUSTOMER.C-ID", constraint: "FK → CUSTOMER" },
      { name: "Amount", type: "DECIMAL(10,2)", constraint: "NOT NULL" },
      { name: "Date", type: "DATE", constraint: "NOT NULL" },
    ],
  },
  {
    name: "MAINTENANCE RECORD",
    category: "Weak Entity",
    primaryKey: ["M-ID", "V-ID"],
    columns: [
      { name: "M-ID", type: "VARCHAR(10)", isPk: true, constraint: "Partial Key" },
      { name: "V-ID", type: "VARCHAR(10)", isPk: true, isFk: true, fkTarget: "VEHICLE.V-ID", constraint: "Identifying FK → VEHICLE" },
      { name: "Service-Date", type: "DATE", constraint: "NOT NULL" },
      { name: "Cost", type: "DECIMAL(10,2)", constraint: "NOT NULL" },
      { name: "Description", type: "TEXT" },
    ],
  },
  {
    name: "BOOKS",
    category: "Junction Table",
    primaryKey: ["C-ID", "E-ID"],
    columns: [
      { name: "C-ID", type: "VARCHAR(10)", isPk: true, isFk: true, fkTarget: "CUSTOMER.C-ID", constraint: "FK → CUSTOMER" },
      { name: "E-ID", type: "VARCHAR(10)", isPk: true, isFk: true, fkTarget: "SALESPERSON.E-ID", constraint: "FK → SALESPERSON" },
      { name: "Booking-Date", type: "DATE", constraint: "NOT NULL" },
    ],
  },
  {
    name: "SERVICES",
    category: "Junction Table",
    primaryKey: ["E-ID", "V-ID"],
    columns: [
      { name: "E-ID", type: "VARCHAR(10)", isPk: true, isFk: true, fkTarget: "MECHANIC.E-ID", constraint: "FK → MECHANIC" },
      { name: "V-ID", type: "VARCHAR(10)", isPk: true, isFk: true, fkTarget: "VEHICLE.V-ID", constraint: "FK → VEHICLE" },
      { name: "Service-Date", type: "DATE", constraint: "NOT NULL" },
    ],
  },
];

function SchemaPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTables = TABLES.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.columns.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PresentationBar />
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
        <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Eyebrow>DATABASE EXPLORER</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Database className="w-7 h-7 text-primary" /> Relational Schema Visualizer
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Formal table structures, data types, primary keys, and foreign key references.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tables or columns..."
                className="rounded-xl bg-surface border border-border pl-9 pr-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary w-64"
              />
            </div>
            <Button asChild size="sm">
              <Link to="/database/sql-lab">
                Open SQL Lab <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Foreign Key Linkage Summary Box */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-3 shadow-lg">
          <span className="text-xs font-mono font-bold uppercase text-primary tracking-wider">
            Foreign Key Relationship Links:
          </span>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-2 border border-border font-mono">
              RentalAgreement.C-ID <span className="text-primary font-bold">→</span> Customer.C-ID
            </div>
            <div className="p-2.5 rounded-lg bg-surface-2 border border-border font-mono">
              RentalAgreement.V-ID <span className="text-primary font-bold">→</span> Vehicle.V-ID
            </div>
            <div className="p-2.5 rounded-lg bg-surface-2 border border-border font-mono">
              Payment.C-ID <span className="text-primary font-bold">→</span> Customer.C-ID
            </div>
            <div className="p-2.5 rounded-lg bg-surface-2 border border-border font-mono">
              MaintenanceRecord.V-ID <span className="text-primary font-bold">→</span> Vehicle.V-ID
            </div>
          </div>
        </div>

        {/* Schema Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTables.map((t) => (
            <div key={t.name} className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground font-mono">{t.name}</h3>
                  <span className="text-[10px] text-muted-foreground uppercase">{t.category}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">
                  PK: {t.primaryKey.join(", ")}
                </span>
              </div>

              {/* Columns Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-border/60 uppercase text-[9px] text-muted-foreground bg-surface-2">
                    <tr>
                      <th className="p-2">Column</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Key</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-[11px]">
                    {t.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-surface-2/50">
                        <td className="p-2 font-bold text-foreground">{col.name}</td>
                        <td className="p-2 text-muted-foreground">{col.type}</td>
                        <td className="p-2">
                          {col.isPk && (
                            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold text-[9px] mr-1">
                              PK
                            </span>
                          )}
                          {col.isFk && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[9px]">
                              FK
                            </span>
                          )}
                          {!col.isPk && !col.isFk && <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
